import express from 'express';
import {
  httpRegisterAdmin,
  getPaymentRequests,
  updatePaymentStatus,
  getHealthcareCoverage,
  updateCoverageStatus
} from '../controllers/admin.controller';

const adminRouter = express.Router();

// Admin registration
adminRouter.post('/register', httpRegisterAdmin);

// Payment management
adminRouter.get('/payments', getPaymentRequests);
adminRouter.put('/payments/status', updatePaymentStatus);

// Healthcare coverage management
adminRouter.get('/coverage', getHealthcareCoverage);
adminRouter.put('/coverage/status', updateCoverageStatus);

export default adminRouter;
