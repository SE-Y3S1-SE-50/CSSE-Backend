const User = require('../models/users.model');
const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const Admin = require('../models/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  registerDoctor,
  getAllUsers,
  updateDoctor,
  registerPatient,
  updatePatient
} = require('../models/auth.model');

const httpUpdateDoctor = async (req, res) => {
  try {
    const doctorId = req.body.doctorId;
    const data = req.body;
    const updatedDoctor = await updateDoctor(doctorId, data);
    res.status(200).json({ message: updatedDoctor });
  } catch (err) {
    console.log("Error in updating doctor", err);
    return res.status(500).json({ message: err.message || 'Error updating doctor' });
  }
};

const httpRegisterDoctor = async (req, res) => {
  try {
    await registerDoctor(req.body);
    res.status(201).json({ message: 'Doctor created successfully' });
  } catch (err) {
    console.log("Error in creating doctor", err);
    return res.status(500).json({ message: err.message || 'Error creating doctor' });
  }
};

const httpUpdatePatient = async (req, res) => {
  try {
    const patientId = req.body.patientId;
    const data = req.body;
    const updatedPatient = await updatePatient(patientId, data);
    res.status(200).json({ message: updatedPatient });
  } catch (err) {
    console.log("Error in updating patient", err);
    return res.status(500).json({ message: err.message || 'Error updating patient' });
  }
};

const httpRegisterPatient = async (req, res) => {
  try {
    await registerPatient(req.body);
    res.status(201).json({ message: 'Patient created successfully' });
  } catch (err) {
    console.log("Error in creating patient", err);
    return res.status(500).json({ message: err.message || 'Error creating patient' });
  }
};

const httpGetAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.log("Error in getting all users", err);
    return res.status(500).json({ message: err.message || 'Error fetching users' });
  }
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation helper
const isValidPassword = (password) => {
  return password && password.length >= 8;
};

/**
 * UNIFIED LOGIN - Works for Patient, Doctor, and Admin
 * Returns role to frontend for routing
 */
const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    console.log("Login attempt for userName:", userName);


    const user = await User.findOne({ userName });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    console.log('User found:', { id: user._id, role: user.role });


    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }


    let entityDetails = null;
    try {
      switch (user.role) {
        case 'Patient':
          entityDetails = await Patient.findById(user.entityId).select('firstName lastName email');
          break;
        case 'Doctor':
          entityDetails = await Doctor.findById(user.entityId).select('firstName lastName email department');
          break;
        case 'Admin':
          entityDetails = await Admin.findById(user.entityId).select('firstName lastName email position');
          break;
        default:
          console.warn('Unknown role:', user.role);
      }
    } catch (err) {
      console.error('Error fetching entity details:', err);
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        entityId: user.entityId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );


    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000  
    });


    return res.status(200).json({
      message: "Login successful",
      role: user.role,              
      userId: user._id,
      entityId: user.entityId,
      user: entityDetails || {
        firstName: 'User',
        lastName: '',
        email: userName
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};


module.exports = {
  login,
  httpRegisterDoctor,
  httpRegisterPatient,
  httpGetAllUsers,
  httpUpdatePatient,
  httpUpdateDoctor
};