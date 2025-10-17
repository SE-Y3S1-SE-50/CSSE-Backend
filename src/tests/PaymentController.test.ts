import { Request, Response } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import Payment from '../models/Payment';
import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose');

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-transaction-id'
}));

describe('PaymentController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
    mockRequest = {
      body: {}
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    beforeEach(() => {
      // Mock Payment.save()
      jest.spyOn(Payment.prototype, 'save').mockResolvedValue({} as any);
    });

    describe('Credit Card Payment', () => {
      beforeEach(() => {
        mockRequest.body = {
          method: 'CreditCard',
          details: {
            cardNumber: '1234567890123456',
            expiryDate: '12/25',
            cvv: '123',
            cardType: 'Visa'
          }
        };
      });

      it('should process successful credit card payment', async () => {
        // Mock successful processing (80% success rate)
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // < 0.8, so success

        await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Payment processed successfully',
          data: {
            transactionId: 'mock-transaction-id',
            status: 'Processed',
            amount: 55.00,
            method: 'CreditCard'
          }
        });
      });

      it('should handle failed credit card payment', async () => {
        // Mock failed processing (20% failure rate)
        jest.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.8, so failure

        await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Payment processed successfully',
          data: {
            transactionId: 'mock-transaction-id',
            status: 'Failed',
            amount: 55.00,
            method: 'CreditCard'
          }
        });
      });

      it('should validate credit card details', async () => {
        mockRequest.body = {
          method: 'CreditCard',
          details: {
            cardNumber: '',
            expiryDate: '12/25',
            cvv: '123'
          }
        };

        await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Internal server error'
        });
      });
    });

    describe('Coverage Payment', () => {
      beforeEach(() => {
        mockRequest.body = {
          method: 'Coverage',
          details: {
            policyId: 'POL-123456',
            serviceReference: 'SRV-789012'
          }
        };
      });

      it('should process successful coverage payment', async () => {
        // Mock successful processing (85% success rate)
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // < 0.85, so success

        await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Payment processed successfully',
          data: {
            transactionId: 'mock-transaction-id',
            status: 'Processed',
            amount: 55.00,
            method: 'Coverage'
          }
        });
      });

      it('should handle coverage rejection', async () => {
        // Mock coverage rejection (15% failure rate)
        jest.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.85, so rejection

        await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Payment processed successfully',
          data: {
            transactionId: 'mock-transaction-id',
            status: 'CoverageRejected',
            amount: 55.00,
            method: 'Coverage'
          }
        });
      });

      it('should validate coverage details', async () => {
        mockRequest.body = {
          method: 'Coverage',
          details: {
            policyId: '',
            serviceReference: 'SRV-789012'
          }
        };

        await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Internal server error'
        });
      });
    });

    describe('Cash Payment', () => {
      beforeEach(() => {
        mockRequest.body = {
          method: 'Cash',
          details: {
            depositReference: 'DEP-123456',
            depositSlipUrl: 'https://example.com/slip.pdf'
          }
        };
      });

      it('should process cash payment with pending verification status', async () => {
        await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Payment processed successfully',
          data: {
            transactionId: 'mock-transaction-id',
            status: 'PendingVerification',
            amount: 55.00,
            method: 'Cash'
          }
        });
      });

      it('should validate cash payment details', async () => {
        mockRequest.body = {
          method: 'Cash',
          details: {
            depositReference: '',
            depositSlipUrl: 'https://example.com/slip.pdf'
          }
        };

        await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Internal server error'
        });
      });
    });

    it('should handle invalid payment method', async () => {
      mockRequest.body = {
        method: 'InvalidMethod',
        details: {}
      };

      await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid payment method'
      });
    });

    it('should handle missing method and details', async () => {
      mockRequest.body = {};

      await PaymentController.processPayment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Method and details are required'
      });
    });
  });

  describe('getPaymentsByUserId', () => {
    it('should return payments for user', async () => {
      const mockPayments = [
        {
          transactionId: 'txn-1',
          userId: 'PAT123',
          amount: 55.00,
          method: 'CreditCard',
          status: 'Processed',
          date: new Date()
        }
      ];

      jest.spyOn(Payment, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockPayments)
          })
        })
      } as any);

      await PaymentController.getPaymentsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPayments
      });
    });

    it('should handle database error', async () => {
      jest.spyOn(Payment, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });

      await PaymentController.getPaymentsByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('verifyCashPayment', () => {
    beforeEach(() => {
      mockRequest.body = {
        transactionId: 'txn-123',
        finalStatus: 'Processed'
      };
    });

    it('should verify cash payment successfully', async () => {
      const mockPayment = {
        transactionId: 'txn-123',
        status: 'Processed'
      };

      jest.spyOn(Payment, 'findOneAndUpdate').mockResolvedValue(mockPayment as any);

      await PaymentController.verifyCashPayment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Payment status updated successfully',
        data: {
          transactionId: 'txn-123',
          status: 'Processed'
        }
      });
    });

    it('should handle missing transaction ID', async () => {
      mockRequest.body = {
        finalStatus: 'Processed'
      };

      await PaymentController.verifyCashPayment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Transaction ID and final status are required'
      });
    });

    it('should handle invalid final status', async () => {
      mockRequest.body = {
        transactionId: 'txn-123',
        finalStatus: 'InvalidStatus'
      };

      await PaymentController.verifyCashPayment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Final status must be either Processed or Failed'
      });
    });

    it('should handle payment not found', async () => {
      jest.spyOn(Payment, 'findOneAndUpdate').mockResolvedValue(null);

      await PaymentController.verifyCashPayment(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Payment not found or not a cash payment'
      });
    });
  });
});
