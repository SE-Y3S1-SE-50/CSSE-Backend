const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getAllAppointments, 
  getAppointmentsByPatient,
  getAppointmentsByEmail,  // Optional backup route
  getAppointmentsByDoctor
} = require('../controllers/appointment.controller');

// Note: Routes are prefixed with /api/appointment in app.js

// Create new appointment
router.post('/', createAppointment);

// Get all appointments (admin use)
router.get('/', getAllAppointments);

// Get appointments by patient ID (PRIMARY ROUTE - Use this in frontend)
router.get('/patient/:patientId', getAppointmentsByPatient);

// OPTIONAL: Get appointments by email (backup route)
router.get('/patient/email/:email', getAppointmentsByEmail);

// Get appointments by doctor ID
router.get('/doctor/:doctorId', getAppointmentsByDoctor);

module.exports = router;