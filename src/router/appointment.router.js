const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getAllAppointments, 
  getAppointmentsByPatient,
  getAppointmentsByDoctor
} = require('../controllers/appointment.controller');

// Note: Routes are prefixed with /api/appointment in app.js
router.post('/', createAppointment);
router.get('/', getAllAppointments);
router.get('/patient/:email', getAppointmentsByPatient);
router.get('/doctor/:doctorId', getAppointmentsByDoctor);

module.exports = router;