import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();

// POST /api/payments - Process a new payment
router.post('/', PaymentController.processPayment);

// GET /api/payments/user - Get payments by user ID
router.get('/user', PaymentController.getPaymentsByUserId);

// PUT /api/payments/verify - Verify cash payment (Admin action)
router.put('/verify', PaymentController.verifyCashPayment);

export default router;
