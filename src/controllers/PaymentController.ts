import { Request, Response } from 'express';
import Payment, { IPayment } from '../models/Payment';
import { v4 as uuidv4 } from 'uuid';

interface PaymentRequest {
  method: 'Coverage' | 'CreditCard' | 'Cash';
  details: {
    lastFourDigits?: string;
    policyId?: string;
    serviceReference?: string;
    depositSlipUrl?: string;
    depositReference?: string;
    expiryDate?: string;
    cardType?: string;
  };
}

interface CoverageDetails {
  policyId: string;
  serviceReference: string;
}

interface CreditCardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
}

interface CashDetails {
  depositReference: string;
  depositSlipUrl: string;
}

export class PaymentController {
  /**
   * Process payment based on method
   */
  public static async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { method, details }: PaymentRequest = req.body;
      const userId = 'PAT123'; // Mock user ID
      const amount = 55.00; // Fixed amount
      const transactionId = uuidv4();

      // Validate required fields
      if (!method || !details) {
        res.status(400).json({
          success: false,
          message: 'Method and details are required'
        });
        return;
      }

      let paymentData: Partial<IPayment>;
      let status: 'Processed' | 'PendingVerification' | 'Failed' | 'CoverageRejected';

      switch (method) {
        case 'CreditCard':
          const result = await PaymentController.processCreditCard(details as CreditCardDetails);
          status = result.status;
          paymentData = {
            transactionId,
            userId,
            amount,
            method,
            status,
            details: {
              lastFourDigits: result.lastFourDigits,
              cardType: result.cardType,
              expiryDate: result.expiryDate
            }
          };
          break;

        case 'Coverage':
          const coverageResult = await PaymentController.processCoverage(details as CoverageDetails);
          status = coverageResult.status;
          paymentData = {
            transactionId,
            userId,
            amount,
            method,
            status,
            details: {
              policyId: coverageResult.policyId,
              serviceReference: coverageResult.serviceReference
            }
          };
          break;

        case 'Cash':
          const cashResult = PaymentController.processCash(details as CashDetails);
          status = cashResult.status;
          paymentData = {
            transactionId,
            userId,
            amount,
            method,
            status,
            details: {
              depositReference: cashResult.depositReference,
              depositSlipUrl: cashResult.depositSlipUrl
            }
          };
          break;

        default:
          res.status(400).json({
            success: false,
            message: 'Invalid payment method'
          });
          return;
      }

      // Save payment to database
      const payment = new Payment(paymentData);
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          transactionId,
          status,
          amount,
          method
        }
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Process credit card payment with 80% success rate
   */
  private static async processCreditCard(details: CreditCardDetails): Promise<{
    status: 'Processed' | 'Failed';
    lastFourDigits: string;
    cardType: string;
    expiryDate: string;
  }> {
    // Validate credit card details
    if (!details.cardNumber || !details.expiryDate || !details.cvv) {
      throw new Error('Invalid credit card details');
    }

    // Extract last 4 digits
    const lastFourDigits = details.cardNumber.slice(-4);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate 80% success rate
    const isSuccess = Math.random() < 0.8;

    return {
      status: isSuccess ? 'Processed' : 'Failed',
      lastFourDigits,
      cardType: details.cardType || 'Visa',
      expiryDate: details.expiryDate
    };
  }

  /**
   * Process coverage payment with 85% success rate
   */
  private static async processCoverage(details: CoverageDetails): Promise<{
    status: 'Processed' | 'CoverageRejected';
    policyId: string;
    serviceReference: string;
  }> {
    // Validate coverage details
    if (!details.policyId || !details.serviceReference) {
      throw new Error('Invalid coverage details');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 85% success rate
    const isSuccess = Math.random() < 0.85;

    return {
      status: isSuccess ? 'Processed' : 'CoverageRejected',
      policyId: details.policyId,
      serviceReference: details.serviceReference
    };
  }

  /**
   * Process cash payment (immediate persistence)
   */
  private static processCash(details: CashDetails): {
    status: 'PendingVerification';
    depositReference: string;
    depositSlipUrl: string;
  } {
    // Validate cash details
    if (!details.depositReference) {
      throw new Error('Deposit reference is required');
    }

    return {
      status: 'PendingVerification',
      depositReference: details.depositReference,
      depositSlipUrl: details.depositSlipUrl || 'https://example.com/deposit-slip.pdf'
    };
  }

  /**
   * Get payments by user ID
   */
  public static async getPaymentsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = 'PAT123'; // Mock user ID
      
      const payments = await Payment.find({ userId })
        .sort({ date: -1 })
        .select('-__v')
        .lean();

      res.status(200).json({
        success: true,
        data: payments
      });

    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Verify cash payment (Admin action)
   */
  public static async verifyCashPayment(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, finalStatus } = req.body;

      if (!transactionId || !finalStatus) {
        res.status(400).json({
          success: false,
          message: 'Transaction ID and final status are required'
        });
        return;
      }

      if (!['Processed', 'Failed'].includes(finalStatus)) {
        res.status(400).json({
          success: false,
          message: 'Final status must be either Processed or Failed'
        });
        return;
      }

      const payment = await Payment.findOneAndUpdate(
        { transactionId, method: 'Cash' },
        { status: finalStatus },
        { new: true }
      );

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found or not a cash payment'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        data: {
          transactionId: payment.transactionId,
          status: payment.status
        }
      });

    } catch (error) {
      console.error('Verify cash payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
