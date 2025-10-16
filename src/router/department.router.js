const express = require('express');
const router = express.Router();
const { getAllDepartments, seedDepartments } = require('../controllers/department.controller');

router.get('/departments', getAllDepartments);
router.post('/departments/seed', seedDepartments);

module.exports = router;
