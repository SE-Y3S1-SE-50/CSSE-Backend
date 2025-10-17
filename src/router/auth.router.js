import express from 'express';
import {
    login,
    httpRegisterDoctor,
    httpGetAllUsers,
    httpRegisterPatient,
    httpUpdatePatient,
    httpUpdateDoctor,
} from '../controllers/auth.controller';
import { httpRegisterAdmin } from '../controllers/admin.controller';


const Userrouter = express.Router();

Userrouter.post('/login', login);
Userrouter.post('/register/doctor', httpRegisterDoctor);
Userrouter.post('/register/patient', httpRegisterPatient);
Userrouter.post('/register/admin', httpRegisterAdmin);
Userrouter.get('/', httpGetAllUsers);
// Userrouter.get('/current/:userId', getCurrentUser);
Userrouter.post('/update/patient', httpUpdatePatient);
Userrouter.post('/update/doctor', httpUpdateDoctor);

export default Userrouter;
