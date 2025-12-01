const express = require("express");
const Razorpay = require("razorpay");
const { authenticate, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const Appointment = require("../modal/Appointment");
const crypto = require("crypto");

const router = express.Router();

// Demo mode flag allows simulating successful payments without Razorpay
const isDemoPaymentMode = process.env.DEMO_PAYMENT_MODE === "true";

// Initialize Razorpay only if credentials are available and demo mode is disabled
let razorPay = null;
const hasRazorpayCredentials =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

if (!isDemoPaymentMode && hasRazorpayCredentials) {
  try {
    razorPay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✓ Razorpay initialized successfully");
  } catch (error) {
    console.error("✗ Failed to initialize Razorpay:", error.message);
  }
} else if (!hasRazorpayCredentials) {
  console.warn(
    "⚠ Razorpay credentials not found. Falling back to demo payment mode."
  );
  console.warn(
    "   Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file to enable live payments."
  );
}

if (isDemoPaymentMode) {
  console.info(
    "ℹ Demo payment mode enabled. No real transactions will be created."
  );
}

const shouldUseDemoPayments = isDemoPaymentMode || !razorPay;

const populateAppointmentRelations = async (appointment) => {
  await appointment.populate(
    "doctorId",
    "name specialization fees hospitalInfo profileImage"
  );
  await appointment.populate(
    "patientId",
    "name email phone profileImage"
  );
  return appointment;
};

const markAppointmentAsPaid = async (
  appointment,
  {
    paymentMethod = "Demo",
    orderId,
    paymentId,
    signature,
    paymentDate = new Date(),
  }
) => {
  appointment.paymentStatus = "Paid";
  appointment.paymentMethod = paymentMethod;
  appointment.razorpayPaymentId = paymentId;
  appointment.razorpayOrderId = orderId;
  appointment.razorpaySignature = signature;
  appointment.paymentDate = paymentDate;

  await appointment.save();
  await populateAppointmentRelations(appointment);

  return appointment;
};

router.post(
  "/create-order",
  authenticate,
  requireRole("patient"),
  [
    body("appointmentId")
      .isMongoId()
      .withMessage("valid appointment ID is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      //find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate("doctorId", "name specialization")
        .populate("patientId", "name email phone");

      if (!appointment) {
        return res.notFound("Appointment not found");
      }

      if (!appointment.patientId || !appointment.doctorId) {
        return res.serverError("Appointment data is incomplete", ["Missing patient or doctor information"]);
      }

      if (appointment.patientId._id.toString() !== req.auth.id) {
        return res.forbidden("Access denied");
      }

      if (appointment.paymentStatus === "Paid") {
        return res.badRequest("Payment already completed");
      }

      if (!appointment.totalAmount || appointment.totalAmount <= 0) {
        return res.badRequest("Invalid appointment amount");
      }

      // Demo payment flow (used when Razorpay is disabled or demo mode is on)
      if (shouldUseDemoPayments) {
        const demoOrderId = `demo_order_${appointmentId}_${Date.now()}`;
        const demoPaymentId = `demo_payment_${Date.now()}`;
        const confirmedAppointment = await markAppointmentAsPaid(appointment, {
          paymentMethod: isDemoPaymentMode ? "Demo" : "Offline (Demo Fallback)",
          orderId: demoOrderId,
          paymentId: demoPaymentId,
          signature: "demo_signature",
        });

        return res.ok(
          {
            demoPayment: true,
            appointment: confirmedAppointment,
          },
          "Demo payment completed. Appointment confirmed successfully."
        );
      }

      // Check if Razorpay is configured
      if (!razorPay) {
        return res.serverError("Payment gateway not configured", ["Razorpay credentials are missing"]);
      }

      const order = await razorPay.orders.create({
        amount: appointment.totalAmount * 100,
        currency: "INR",
        receipt: `appointment_${appointmentId}`,
        notes: {
          appointmentId: appointmentId,
          doctorName: appointment.doctorId.name,
          patientName: appointment.patientId.name,
          consultationType: appointment.consultationType,
          date: appointment.date,
          slotStart: appointment.slotStartIso,
          slotEnd: appointment.slotEndIso,
        },
      });

      res.ok(
        {
          orderId: order.id,
          amount: appointment.totalAmount,
          currency: "INR",
          key: process.env.RAZORPAY_KEY_ID,
        },
        "Payment order created successfully"
      );
    } catch (error) {
      console.error("Create payment order error:", error);
      
      // Handle Razorpay specific errors
      if (error.statusCode === 401 || (error.error && error.error.code === 'BAD_REQUEST_ERROR')) {
        return res.serverError(
          "Razorpay authentication failed", 
          [
            "Invalid Razorpay credentials. Please check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the .env file.",
            "Make sure you're using the correct test/live keys from your Razorpay dashboard.",
            error.error?.description || error.message
          ]
        );
      }
      
      if (error.statusCode === 400) {
        return res.badRequest(
          "Invalid payment request",
          [error.error?.description || error.message]
        );
      }

      // Generic error
      res.serverError(
        "Failed to create payment order", 
        [error.error?.description || error.message || "Unknown error occurred"]
      );
    }
  }
);

router.post(
  "/verify-payment",
  authenticate,
  requireRole("patient"),
  [
    body("appointmentId")
      .isMongoId()
      .withMessage("valid appointment ID is required"),
    body("razorpay_order_id")
      .isString()
      .withMessage("Razorpay order Id required"),
    body("razorpay_payment_id")
      .isString()
      .withMessage("Razorpay payment Id required"),
    body("razorpay_signature")
      .isString()
      .withMessage("Razorpay signature required"),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        appointmentId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      //find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate("doctorId", "name specialization")
        .populate("patientId", "name email phone");

      if (!appointment) {
        return res.notFound("Appointment not found");
      }

      if (!appointment.patientId || !appointment.doctorId) {
        return res.serverError("Appointment data is incomplete", ["Missing patient or doctor information"]);
      }

      if (appointment.patientId._id.toString() !== req.auth.id) {
        return res.forbidden("Access denied");
      }

      // Check if Razorpay is configured
      if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.serverError("Payment gateway not configured", ["Razorpay key secret is missing"]);
      }

      //verify payment signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;
      if (!isAuthentic) {
        return res.badRequest("Payment verification failed");
      }

      const confirmedAppointment = await markAppointmentAsPaid(appointment, {
        paymentMethod: "RazorPay",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
      });

      res.ok(
        confirmedAppointment,
        "Payment verified and appointment confirmed successfully"
      );
    } catch (error) {
      console.error("Verify payment error:", error);
      res.serverError("Failed to verify payment", [error.message]);
    }
  }
);


 module.exports = router;