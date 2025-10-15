const { httpGetDoctorById } = require('../controllers/doctor.controller');
const express = require('express');

const DoctorRouter = express.Router();

DoctorRouter.get('/:id', httpGetDoctorById);

module.exports = DoctorRouter;