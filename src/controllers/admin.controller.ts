import { Request, Response } from 'express';
import User from '../models/users.model';
import bcrypt from 'bcryptjs';
import Payment from '../models/Payment';

// Admin registration function (already exists)
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

// Get all payment requests for admin dashboard
export const getPaymentRequests = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'userName firstName lastName email phoneNumber')
      .sort({ date: -1 });

    const paymentRequests = payments.map(payment => ({
      id: payment._id,
      userId: payment.userId,
      userName: (payment.userId as any)?.userName || 'Unknown',
      patientName: (payment.userId as any)?.firstName && (payment.userId as any)?.lastName 
        ? `${(payment.userId as any).firstName} ${(payment.userId as any).lastName}`
        : (payment.userId as any)?.userName || 'Unknown',
      patientEmail: (payment.userId as any)?.email || 'Not provided',
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      details: payment.details,
      date: payment.date
    }));

    return res.status(200).json({
      success: true,
      data: paymentRequests
    });
  } catch (err: any) {
    console.log("Error fetching payment requests", err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Error fetching payment requests' 
    });
  }
};

// Update payment status (approve/decline)
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId, status } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment ID and status are required' 
      });
    }

    const validStatuses = ['Pending', 'Approved', 'Declined', 'Processed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status. Must be one of: Pending, Approved, Declined, Processed' 
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    ).populate('userId', 'userName firstName lastName email phoneNumber');

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: `Payment ${status.toLowerCase()} successfully`,
      data: {
        id: payment._id,
        status: payment.status,
        patientName: (payment.userId as any)?.firstName && (payment.userId as any)?.lastName 
          ? `${(payment.userId as any).firstName} ${(payment.userId as any).lastName}`
          : (payment.userId as any)?.userName || 'Unknown'
      }
    });
  } catch (err: any) {
    console.log("Error updating payment status", err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Error updating payment status' 
    });
  }
};

// Get healthcare coverage list
export const getHealthcareCoverage = async (req: Request, res: Response) => {
  try {
    // For now, we'll create mock data since we don't have a separate coverage model
    // In a real application, you'd have a Coverage model
    const coverageList = [
      {
        id: '1',
        policyId: 'POL-123456',
        provider: 'Blue Cross Blue Shield',
        coverageType: 'Primary Care',
        isActive: true,
        patientId: 'user2',
        patientName: 'Jane Smith'
      },
      {
        id: '2',
        policyId: 'POL-789012',
        provider: 'Aetna',
        coverageType: 'Comprehensive',
        isActive: true,
        patientId: 'user4',
        patientName: 'Alice Johnson'
      },
      {
        id: '3',
        policyId: 'POL-345678',
        provider: 'Cigna',
        coverageType: 'Basic',
        isActive: false,
        patientId: 'user5',
        patientName: 'Charlie Brown'
      }
    ];

    return res.status(200).json({
      success: true,
      data: coverageList
    });
  } catch (err: any) {
    console.log("Error fetching healthcare coverage", err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Error fetching healthcare coverage' 
    });
  }
};

// Update healthcare coverage status
export const updateCoverageStatus = async (req: Request, res: Response) => {
  try {
    const { coverageId, isActive } = req.body;

    if (!coverageId || typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: 'Coverage ID and isActive status are required' 
      });
    }

    // In a real application, you'd update the coverage in the database
    // For now, we'll just return success
    return res.status(200).json({
      success: true,
      message: `Coverage ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: coverageId,
        isActive: isActive
      }
    });
  } catch (err: any) {
    console.log("Error updating coverage status", err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Error updating coverage status' 
    });
  }
};