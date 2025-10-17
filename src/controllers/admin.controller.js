const bcrypt = require('bcryptjs');
const User = require('../models/users.model');
const Admin = require('../models/admin.model');
const Payment = require('../models/Payment');

// ============================================
// ADMIN REGISTRATION
// ============================================

const httpRegisterAdmin = async (req, res) => {
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
  } catch (err) {
    console.log('Error in creating admin', err);
    return res.status(500).json({ message: err.message || 'Error creating admin' });
  }
};

// ============================================
// ADMIN MANAGEMENT
// ============================================

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ isActive: true }).select('-__v');
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error fetching admins' });
  }
};

// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id).select('-__v');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json(admin);
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ message: 'Error fetching admin' });
  }
};

// Delete admin (soft delete)
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete the admin
    const admin = await Admin.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Also deactivate the associated user account
    await User.findOneAndUpdate(
      { entityId: id, role: 'Admin' },
      { $set: { isActive: false } }
    );
    
    res.status(200).json({ message: 'Admin deactivated successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Error deleting admin' });
  }
};

// ============================================
// PAYMENT MANAGEMENT
// ============================================

// Get all payment requests for admin dashboard
const getPaymentRequests = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'userName firstName lastName email phoneNumber')
      .sort({ date: -1 });

    const paymentRequests = payments.map(payment => ({
      id: payment._id,
      userId: payment.userId,
      userName: payment.userId?.userName || 'Unknown',
      patientName: payment.userId?.firstName && payment.userId?.lastName 
        ? `${payment.userId.firstName} ${payment.userId.lastName}`
        : payment.userId?.userName || 'Unknown',
      patientEmail: payment.userId?.email || 'Not provided',
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
  } catch (err) {
    console.log('Error fetching payment requests', err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Error fetching payment requests' 
    });
  }
};

// Update payment status (approve/decline)
const updatePaymentStatus = async (req, res) => {
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
        patientName: payment.userId?.firstName && payment.userId?.lastName 
          ? `${payment.userId.firstName} ${payment.userId.lastName}`
          : payment.userId?.userName || 'Unknown'
      }
    });
  } catch (err) {
    console.log('Error updating payment status', err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Error updating payment status' 
    });
  }
};

// ============================================
// HEALTHCARE COVERAGE MANAGEMENT
// ============================================

// Get healthcare coverage list
const getHealthcareCoverage = async (req, res) => {
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
  } catch (err) {
    console.log('Error fetching healthcare coverage', err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Error fetching healthcare coverage' 
    });
  }
};

// Update healthcare coverage status
const updateCoverageStatus = async (req, res) => {
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
  } catch (err) {
    console.log('Error updating coverage status', err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Error updating coverage status' 
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Admin registration and management
  httpRegisterAdmin,
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  
  // Payment management
  getPaymentRequests,
  updatePaymentStatus,
  
  // Healthcare coverage management
  getHealthcareCoverage,
  updateCoverageStatus
};
