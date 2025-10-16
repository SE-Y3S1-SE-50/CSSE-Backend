const { httpGetDoctorById } = require('../controllers/doctor.controller');
const express = require('express');
const { 
  getAllDoctors, 
  getDoctorsByDepartment, 
  getAvailableSlots,
  migrateDoctor,
  seedDoctors 
} = require('../controllers/doctor.controller');

const DoctorRouter = express.Router();

DoctorRouter.get('/:id', httpGetDoctorById);

DoctorRouter.get('/doctors', getAllDoctors);
DoctorRouter.get('/doctors/department/:department', getDoctorsByDepartment);
DoctorRouter.get('/doctors/:doctorId/slots', getAvailableSlots);
DoctorRouter.put('/doctors/migrate/:email', migrateDoctor); // For migrating existing doctors
DoctorRouter.post('/doctors/seed', seedDoctors); // For development only


module.exports = DoctorRouter;



