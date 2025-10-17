const express = require('express');
const {
  login,
  httpRegisterDoctor,
  httpRegisterPatient,
  httpRegisterAdmin,
  httpGetAllUsers,
  httpUpdatePatient,
  httpUpdateDoctor,
  httpUpdateAdmin
} = require('../controllers/auth.controller');

const {
  getPaymentRequests,
  updatePaymentStatus,
  getHealthcareCoverage,
  updateCoverageStatus,
  getAllAdmins,
  getAdminById,
  deleteAdmin
} = require('../controllers/admin.controller');

// ============================================
// USER & ADMIN ROUTER
// ============================================

const userAdminRouter = express.Router();

// ==================== LOGIN ====================
userAdminRouter.post('/login', login);

// ==================== USER REGISTRATION ROUTES ====================
userAdminRouter.post('/register/patient', httpRegisterPatient);
userAdminRouter.post('/register/doctor', httpRegisterDoctor);
userAdminRouter.post('/register/admin', httpRegisterAdmin);

// ==================== USER UPDATE ROUTES ====================
userAdminRouter.put('/update/patient', httpUpdatePatient);
userAdminRouter.put('/update/doctor', httpUpdateDoctor);
userAdminRouter.put('/update/admin', httpUpdateAdmin);

// ==================== GET ALL USERS ====================
userAdminRouter.get('/', httpGetAllUsers);

// ==================== ADMIN MANAGEMENT ROUTES ====================
userAdminRouter.get('/admin', getAllAdmins);
userAdminRouter.get('/admin/:id', getAdminById);
userAdminRouter.delete('/admin/:id', deleteAdmin);

// ==================== PAYMENT MANAGEMENT ROUTES ====================
userAdminRouter.get('/admin/payments', getPaymentRequests);
userAdminRouter.put('/admin/payments/status', updatePaymentStatus);

// ==================== HEALTHCARE COVERAGE ROUTES ====================
userAdminRouter.get('/admin/coverage', getHealthcareCoverage);
userAdminRouter.put('/admin/coverage/status', updateCoverageStatus);

module.exports = userAdminRouter;
