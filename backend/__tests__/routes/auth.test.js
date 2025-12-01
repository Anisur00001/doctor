const request = require('supertest');
const mongoose = require('mongoose');
// Set env before requiring server
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
const app = require('../../server');
const Doctor = require('../../modal/Doctor');
const Patient = require('../../modal/Patient');
const bcrypt = require('bcryptjs');

describe('Auth Routes', () => {
  describe('POST /api/auth/doctor/register', () => {
    it('should register a new doctor successfully', async () => {
      const doctorData = {
        name: 'Dr. John Doe',
        email: 'doctor@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/doctor/register')
        .send(doctorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.type).toBe('doctor');
    });

    it('should reject registration with existing email', async () => {
      const doctorData = {
        name: 'Dr. John Doe',
        email: 'doctor@test.com',
        password: 'password123'
      };

      await Doctor.create({
        ...doctorData,
        password: await bcrypt.hash(doctorData.password, 12)
      });

      const response = await request(app)
        .post('/api/auth/doctor/register')
        .send(doctorData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const doctorData = {
        name: 'Dr. John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/doctor/register')
        .send(doctorData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/doctor/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      await Doctor.create({
        name: 'Dr. John Doe',
        email: 'doctor@test.com',
        password: hashedPassword
      });
    });

    it('should login doctor with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/doctor/login')
        .send({
          email: 'doctor@test.com',
          password: 'password123'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/doctor/login')
        .send({
          email: 'doctor@test.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/patient/register', () => {
    it('should register a new patient successfully', async () => {
      const patientData = {
        name: 'Jane Doe',
        email: 'patient@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/patient/register')
        .send(patientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.type).toBe('patient');
    });
  });
});

