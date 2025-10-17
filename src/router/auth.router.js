const express = require('express');
const {
    login,
    httpRegisterDoctor,
    httpGetAllUsers,
    httpRegisterPatient,
    httpUpdatePatient,
    httpUpdateDoctor,
} = require('../controllers/auth.controller');
const { httpRegisterAdmin } = require('../controllers/admin.controller');

const Userrouter = express.Router();

Userrouter.post('/login', login);
Userrouter.post('/register/doctor', httpRegisterDoctor);
Userrouter.post('/register/patient', httpRegisterPatient);
Userrouter.post('/register/admin', httpRegisterAdmin);
Userrouter.get('/', httpGetAllUsers);
Userrouter.post('/update/patient', httpUpdatePatient);
Userrouter.post('/update/doctor', httpUpdateDoctor);

module.exports = Userrouter;