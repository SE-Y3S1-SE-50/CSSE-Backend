import express from 'express';
import {
  applyForCoverage,
  getCoverageStatus,
  getAllCoverageApplications,
  updateCoverageStatus
} from '../controllers/coverage.controller';

const coverageRouter = express.Router();

// User routes
coverageRouter.post('/apply', applyForCoverage);
coverageRouter.get('/status/:userId', getCoverageStatus);

// Admin routes
coverageRouter.get('/admin/applications', getAllCoverageApplications);
coverageRouter.put('/admin/status', updateCoverageStatus);

export default coverageRouter;
