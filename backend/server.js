const express = require('express')
const mongoose = require('mongoose');
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config();
require('./config/passport')
const passportLib = require('passport');

const response = require('./middleware/response');



const app = express();

//helmet is a security middleware for Express 
//It helps protect your app by settings various HTTP headers
app.use(helmet());

//morgan is an HTTP request logger middleware
app.use(morgan('dev'))
app.use(cors({
    origin: (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean) || '*',
    credentials:true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


//used response
app.use(response);


//Initialize passport
app.use(passportLib.initialize());

//Mongodb connection (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor Appointment API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      doctor: '/api/doctor',
      patient: '/api/patient',
      appointment: '/api/appointment',
      payment: '/api/payment'
    }
  });
});

app.use('/api/auth', require('./routes/auth'))
app.use('/api/doctor', require('./routes/doctor'))
app.use('/api/patient', require('./routes/patient'))
app.use('/api/appointment', require('./routes/appointment'))
app.use('/api/payment',require('./routes/payment'))

app.get('/health', (req,res) => res.ok({time: new Date().toISOString()}, 'OK'))

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      auth: '/api/auth',
      doctor: '/api/doctor',
      patient: '/api/patient',
      appointment: '/api/appointment',
      payment: '/api/payment'
    }
  });
});


const PORT = process.env.PORT || 8000;

// Only start server if not in test environment or Vercel
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT , () => console.log(`Server listening on ${PORT}`));
}

module.exports = app;