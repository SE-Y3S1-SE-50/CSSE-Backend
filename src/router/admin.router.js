const express = require('express');
const {
    registerAdmin,
    getAllAdmins,
    updateAdmin,
    deleteAdmin
} = require('../controllers/admin.controller');

const adminRouter = express.Router();

// Admin routes
adminRouter.post('/register', registerAdmin);
adminRouter.get('/', getAllAdmins);
adminRouter.put('/:id', updateAdmin);
adminRouter.delete('/:id', deleteAdmin);

module.exports = adminRouter;
