const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getAllAppointments, 
  getAppointmentsByPatient,
  getAppointmentsByDoctor
} = require('../controllers/appointment.controller');

router.post('/appointments', createAppointment);
router.get('/appointments', getAllAppointments);
router.get('/appointments/patient/:email', getAppointmentsByPatient);
router.get('/appointments/doctor/:doctorId', getAppointmentsByDoctor);

module.exports = router;
