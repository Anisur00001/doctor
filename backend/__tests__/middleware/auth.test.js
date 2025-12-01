// Set env before requiring modules
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
const jwt = require('jsonwebtoken');
const { authenticate } = require('../../middleware/auth');
const Doctor = require('../../modal/Doctor');
const Patient = require('../../modal/Patient');
const bcrypt = require('bcryptjs');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      auth: null,
      user: null
    };
    res = {
      unauthorized: jest.fn().mockReturnThis(),
      forbidden: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('should reject request without authorization header', async () => {
    await authenticate(req, res, next);
    expect(res.unauthorized).toHaveBeenCalledWith('Missing authorization header');
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request without token', async () => {
    req.headers.authorization = 'Bearer ';
    await authenticate(req, res, next);
    expect(res.unauthorized).toHaveBeenCalledWith('Missing token');
    expect(next).not.toHaveBeenCalled();
  });

  it('should authenticate doctor with valid token', async () => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const doctor = await Doctor.create({
      name: 'Dr. Test',
      email: 'doctor@test.com',
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: doctor._id.toString(), type: 'doctor' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    req.headers.authorization = `Bearer ${token}`;

    await authenticate(req, res, next);

    expect(req.auth).toBeDefined();
    expect(req.auth.type).toBe('doctor');
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});

