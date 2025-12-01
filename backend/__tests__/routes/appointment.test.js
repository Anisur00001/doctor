const request = require('supertest');
// Set env before requiring server
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
const app = require('../../server');
const Appointment = require('../../modal/Appointment');
const Doctor = require('../../modal/Doctor');
const Patient = require('../../modal/Patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Appointment Routes', () => {
  let doctorToken, patientToken, doctorId, patientId;

  beforeEach(async () => {
    // Create test doctor
    const hashedPassword = await bcrypt.hash('password123', 12);
    const doctor = await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: hashedPassword,
      specialization: 'Cardiologist',
      fees: 500,
      isVerified: true
    });
    doctorId = doctor._id;
    doctorToken = jwt.sign(
      { id: doctorId.toString(), type: 'doctor' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    // Create test patient
    const patient = await Patient.create({
      name: 'Patient Test',
      email: 'patient@test.com',
      password: hashedPassword
    });
    patientId = patient._id;
    patientToken = jwt.sign(
      { id: patientId.toString(), type: 'patient' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );
  });

  describe('GET /api/appointment/doctor', () => {
    it('should get doctor appointments', async () => {
      const response = await request(app)
        .get('/api/appointment/doctor')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/appointment/patient', () => {
    it('should get patient appointments', async () => {
      const response = await request(app)
        .get('/api/appointment/patient')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/appointment/book', () => {
    it('should book an appointment', async () => {
      const slotStart = new Date();
      slotStart.setHours(10, 0, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(10, 30, 0, 0);

      const appointmentData = {
        doctorId: doctorId.toString(),
        slotStartIso: slotStart.toISOString(),
        slotEndIso: slotEnd.toISOString(),
        date: slotStart.toISOString(),
        consultationType: 'Video Consultation',
        symptoms: 'Headache and fever for 3 days',
        consultationFees: 500,
        platformFees: 50,
        totalAmount: 550
      };

      const response = await request(app)
        .post('/api/appointment/book')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.doctorId).toBeDefined();
      expect(response.body.data.patientId).toBeDefined();
    });
  });
});

