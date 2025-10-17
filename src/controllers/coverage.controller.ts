import { Request, Response } from 'express';
import CoverageApplication from '../models/CoverageApplication';
import User from '../models/users.model';

// Apply for healthcare coverage
export const applyForCoverage = async (req: Request, res: Response) => {
  try {
    const { userId, policyId, provider, coverageType } = req.body;

    if (!userId || !policyId || !provider || !coverageType) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate userId format (should be a valid MongoDB ObjectId)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has a pending application
    const existingApplication = await CoverageApplication.findOne({
      userId,
      status: 'Pending'
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending coverage application'
      });
    }

    // Create new coverage application
    const coverageApplication = new CoverageApplication({
      userId,
      patientName: user.userName, // You can enhance this with actual patient details
      patientEmail: (user as any).email || 'Not provided',
      policyId,
      provider,
      coverageType,
      status: 'Pending'
    });

    await coverageApplication.save();

    return res.status(201).json({
      success: true,
      message: 'Coverage application submitted successfully',
      data: {
        id: coverageApplication._id,
        status: coverageApplication.status,
        applicationDate: coverageApplication.applicationDate
      }
    });
  } catch (err: any) {
    console.log("Error applying for coverage", err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error applying for coverage'
    });
  }
};

// Get user's coverage application status
export const getCoverageStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate userId format (should be a valid MongoDB ObjectId)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const application = await CoverageApplication.findOne({ userId })
      .sort({ applicationDate: -1 });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No coverage application found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: application._id,
        status: application.status,
        policyId: application.policyId,
        provider: application.provider,
        coverageType: application.coverageType,
        applicationDate: application.applicationDate,
        adminNotes: application.adminNotes,
        approvedDate: application.approvedDate
      }
    });
  } catch (err: any) {
    console.log("Error getting coverage status", err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error getting coverage status'
    });
  }
};

// Get all coverage applications for admin
export const getAllCoverageApplications = async (req: Request, res: Response) => {
  try {
    const applications = await CoverageApplication.find()
      .populate('userId', 'userName firstName lastName email phoneNumber')
      .sort({ applicationDate: -1 });

    const applicationList = applications.map(app => ({
      id: app._id,
      userId: app.userId,
      patientName: app.patientName,
      patientEmail: app.patientEmail,
      policyId: app.policyId,
      provider: app.provider,
      coverageType: app.coverageType,
      status: app.status,
      applicationDate: app.applicationDate,
      adminNotes: app.adminNotes,
      approvedBy: app.approvedBy,
      approvedDate: app.approvedDate
    }));

    return res.status(200).json({
      success: true,
      data: applicationList
    });
  } catch (err: any) {
    console.log("Error getting coverage applications", err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error getting coverage applications'
    });
  }
};

// Update coverage application status (admin only)
export const updateCoverageStatus = async (req: Request, res: Response) => {
  try {
    const { applicationId, status, adminNotes, approvedBy } = req.body;

    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and status are required'
      });
    }

    const validStatuses = ['Pending', 'Approved', 'Declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Pending, Approved, Declined'
      });
    }

    const updateData: any = {
      status,
      adminNotes: adminNotes || ''
    };

    if (status === 'Approved' || status === 'Declined') {
      updateData.approvedBy = approvedBy;
      updateData.approvedDate = new Date();
    }

    const application = await CoverageApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('userId', 'userName firstName lastName email phoneNumber');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Coverage application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Coverage application ${status.toLowerCase()} successfully`,
      data: {
        id: application._id,
        status: application.status,
        patientName: application.patientName,
        adminNotes: application.adminNotes,
        approvedDate: application.approvedDate
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
