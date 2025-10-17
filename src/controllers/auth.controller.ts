import { Request, Response } from 'express';
import User from '../models/users.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  registerDoctor,
  getAllUsers,
  updateDoctor,
  registerPatient,
  updatePatient
} from '../models/auth.model';


export const httpRegisterDoctor = async (req: Request, res: Response) => {
  try {
    await registerDoctor(req.body);
    return res.status(201).json({ message: 'Doctor created successfully' });
  } catch (err: any) {
    console.log("Error in creating doctor", err);
    return res.status(500).json({ message: err.message || 'Error creating doctor' });
  }
};

export const httpUpdatePatient = async (req: Request, res: Response) => {
  try {
    const patientId = req.body.patientId;
    const data = req.body;
    const updatedPatient = await updatePatient(patientId, data);
    return res.status(200).json({ message: updatedPatient });
  } catch (err: any) {
    console.log("Error in updating patient", err);
    return res.status(500).json({ message: err.message || 'Error updating patient' });
  }
};

export const httpRegisterPatient = async (req: Request, res: Response) => {
  try {
    const result = await registerPatient(req.body);
    
    // Find the created user to return complete data
    const user = await User.findOne({ userName: req.body.userName });
    if (user) {
      const Patient = (await import('../models/patient.model')).default;
      const userProfile = await Patient.findById(user.entityId);
      
      return res.status(201).json({ 
        message: 'Patient created successfully',
        id: user._id,
        userId: user._id,
        userName: user.userName,
        role: user.role,
        firstName: userProfile?.firstName || req.body.firstName,
        lastName: userProfile?.lastName || req.body.lastName,
        email: userProfile?.email || req.body.email,
        phoneNumber: userProfile?.phoneNumber || req.body.phoneNumber,
        gender: userProfile?.gender || req.body.gender
      });
    } else {
      return res.status(201).json({ message: 'Patient created successfully' });
    }
  } catch (err: any) {
    console.log("Error in creating patient", err);
    return res.status(500).json({ message: err.message || 'Error creating patient' });
  }
};

export const httpGetAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (err: any) {
    console.log("Error in getting all users", err);
    return res.status(500).json({ message: err.message || 'Error fetching users' });
  }
};

// Moved getCurrentUser function to the top for proper export
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch complete user profile data based on role
    let userProfile = null;
    if (user.role === 'Patient') {
      const Patient = (await import('../models/patient.model')).default;
      userProfile = await Patient.findById(user.entityId);
    } else if (user.role === 'Doctor') {
      const Doctor = (await import('../models/doctor.model')).default;
      userProfile = await Doctor.findById(user.entityId);
    }

    return res.status(200).json({
      id: user._id,
      userId: user._id,
      userName: user.userName,
      role: user.role,
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      phoneNumber: userProfile?.phoneNumber || '',
      gender: userProfile?.gender || ''
    });
  } catch (err: any) {
    console.log("Error in getting current user", err);
    return res.status(500).json({ message: err.message || 'Error fetching user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;
    
    if (!userName || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Fetch complete user profile data based on role
    let userProfile = null;
    if (user.role === 'Patient' && user.entityId) {
      try {
        const Patient = (await import('../models/patient.model')).default;
        userProfile = await Patient.findById(user.entityId);
      } catch (error) {
        console.log('Error fetching patient profile:', error);
      }
    } else if (user.role === 'Doctor' && user.entityId) {
      try {
        const Doctor = (await import('../models/doctor.model')).default;
        userProfile = await Doctor.findById(user.entityId);
      } catch (error) {
        console.log('Error fetching doctor profile:', error);
      }
    }

    const responseData = {
      message: "Login successful",
      id: user._id,
      userId: user._id,
      userName: user.userName,
      role: user.role,
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      phoneNumber: userProfile?.phoneNumber || '',
      gender: userProfile?.gender || '',
      entityId: user.entityId || null,
      hasProfile: !!userProfile
    };

    // Set JWT token and cookie
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3600000
    });

    res.json(responseData);
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const httpRegisterAdmin = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ userName });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = new User({
      userName,
      password: hashedPassword,
      role: 'Admin',
      entityId: null
    });

    await adminUser.save();

    return res.status(201).json({
      message: 'Admin created successfully',
      id: adminUser._id,
      userName: adminUser.userName,
      role: adminUser.role
    });
  } catch (err: any) {
    console.log("Error in creating admin", err);
    return res.status(500).json({ message: err.message || 'Error creating admin' });
  }
};

export const httpUpdateDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = req.body.doctorId;
    const data = req.body;
    const updatedDoctor = await updateDoctor(doctorId, data);
    return res.status(200).json({ message: updatedDoctor });
  } catch (err: any) {
    console.log("Error in updating doctor", err);
    return res.status(500).json({ message: err.message || 'Error updating doctor' });
  }
};
