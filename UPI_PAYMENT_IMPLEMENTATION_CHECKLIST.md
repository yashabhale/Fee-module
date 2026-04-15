# UPI Payment Implementation Checklist

> This checklist tracks the complete UPI payment implementation for your school fee module.

## ✅ Completed Tasks

### Backend Setup
- [x] Created Razorpay configuration (`backend/config/razorpay.js`)
- [x] Created Payment Service (`backend/services/paymentService.js`)
  - [x] `createOrder()` - Creates Razorpay orders
  - [x] `verifyPaymentSignature()` - Verifies payment authenticity
  - [x] `updateFeePaymentAfterSuccess()` - Updates database
  - [x] `getPaymentDetails()` - Fetches payment info
  - [x] `refundPayment()` - Processes refunds

- [x] Created Payment Controller (`backend/controllers/paymentController.js`)
  - [x] `POST /create-order` - Create payment order
  - [x] `POST /verify-payment` - Verify payment signature
  - [x] `POST /webhook` - Razorpay webhook handler
  - [x] `GET /status/:paymentId` - Get payment status
  - [x] `POST /refund` - Refund a payment

- [x] Created Payment Routes (`backend/routes/paymentRoutes.js`)
- [x] Updated server.js to include payment routes

### Frontend Setup
- [x] Created Payment Service (`src/services/paymentService.js`)
  - [x] `createPaymentOrder()` - Call backend to create order
  - [x] `verifyPaymentSignature()` - Verify payment with backend
  - [x] `getPaymentStatus()` - Fetch payment status
  - [x] `initializeRazorpayPayment()` - Open Razorpay checkout
  - [x] `processUPIPayment()` - Complete UPI payment flow
  - [x] `generateUPILink()` - Generate UPI deep link
  - [x] `generateQRCode()` - Generate payment QR code

- [x] Updated Payment.jsx component
  - [x] Load Razorpay script dynamically
  - [x] Integrate UPI payment handler
  - [x] Set UPI as default payment method
  - [x] Handle payment success/error
  - [x] Store payment data in sessionStorage

### Documentation
- [x] Created UPI_PAYMENT_SETUP_GUIDE.md
  - [x] Razorpay account setup instructions
  - [x] Environment variable configuration
  - [x] Database schema requirements
  - [x] API endpoint documentation
  - [x] Testing guide with test credentials
  - [x] Production deployment checklist
  - [x] Troubleshooting guide
  - [x] Security best practices

## 🔄 Next Steps (Manual Configuration)

### 1. Razorpay Account Setup
- [ ] Create Razorpay business account at https://razorpay.com
- [ ] Complete KYC verification
- [ ] Generate API Keys from Dashboard
- [ ] Setup Webhook endpoint in Dashboard

### 2. Environment Variables
- [ ] Add `RAZORPAY_KEY_ID` to backend `.env`
- [ ] Add `RAZORPAY_KEY_SECRET` to backend `.env`
- [ ] Add `RAZORPAY_WEBHOOK_SECRET` to backend `.env`
- [ ] Add `VITE_RAZORPAY_KEY` to frontend `.env`
- [ ] Add `VITE_API_BASE_URL` to frontend `.env`

### 3. Dependencies Installation
- [ ] Run `cd backend && npm install razorpay`
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Verify `package.json` includes razorpay

### 4. Database Schema Updates
- [ ] Connect to your database
- [ ] Run migration to add payment fields to fee_payments table:
  - [ ] `payment_status` (VARCHAR) - Pending/Paid/Failed
  - [ ] `payment_method` (VARCHAR) - UPI/Card/NetBanking
  - [ ] `payment_gateway` (VARCHAR) - Razorpay
  - [ ] `transaction_id` (VARCHAR) - Payment gateway ID
  - [ ] `order_id` (VARCHAR) - Order reference
  - [ ] `vpa` (VARCHAR) - UPI ID
  - [ ] `payment_date` (TIMESTAMP) - Payment timestamp

### 5. Server Startup & Testing
- [ ] Start backend server: `cd backend && npm start`
- [ ] Start frontend: `npm run dev`
- [ ] Test payment creation endpoint
- [ ] Test payment verification workflow
- [ ] Verify webhook delivery

### 6. Complete Payment Testing
- [ ] Test UPI payment with Razorpay test credentials
- [ ] Verify payment status in Razorpay Dashboard
- [ ] Check fee_payments table for updated records
- [ ] Verify webhook is being called
- [ ] Check payment success page

### 7. Production Deployment
- [ ] Switch Razorpay to Live mode
- [ ] Update API keys to production keys
- [ ] Deploy backend with new environment variables
- [ ] Deploy frontend with production API URL
- [ ] Setup HTTPS on all endpoints
- [ ] Configure production webhook URL
- [ ] Test with small real transaction
- [ ] Monitor payment logs

## 📋 Files Modified/Created

### New Files
- ✅ `backend/config/razorpay.js` - Razorpay configuration
- ✅ `backend/services/paymentService.js` - Payment business logic
- ✅ `backend/controllers/paymentController.js` - Payment API handlers
- ✅ `backend/routes/paymentRoutes.js` - Payment API routes
- ✅ `src/services/paymentService.js` - Frontend payment service
- ✅ `UPI_PAYMENT_SETUP_GUIDE.md` - Complete setup guide
- ✅ `UPI_PAYMENT_IMPLEMENTATION_CHECKLIST.md` - This file

### Modified Files
- ✅ `backend/server.js` - Added payment routes
- ✅ `src/pages/Payment.jsx` - Integrated UPI payment flow

## 🔐 Security Checklist

- [ ] Secret keys stored in `.env` (never in code)
- [ ] `.env` added to `.gitignore`
- [ ] Webhook signature verification implemented
- [ ] Amount validation on backend (not just frontend)
- [ ] HTTPS enabled for production
- [ ] Database queries use parameterized statements
- [ ] User authentication check on payment endpoints
- [ ] Payment logs don't contain sensitive data
- [ ] Rate limiting on payment endpoints
- [ ] CORS properly configured

## 🧪 Test Scenarios

### Happy Path
- [ ] User selects UPI payment method
- [ ] Payment order is created on backend
- [ ] Razorpay checkout opens
- [ ] User completes payment with test credentials
- [ ] Payment is verified on backend
- [ ] Fee payment record is updated with:
  - [ ] `paymentStatus = 'Paid'`
  - [ ] `amountPaid = total amount`
  - [ ] `transactionId = payment ID`
  - [ ] `paymentMethod = 'UPI'`
  - [ ] `payment_date = current timestamp`
- [ ] User redirected to success page
- [ ] Receipt shows payment confirmed

### Error Scenarios
- [ ] User cancels payment (window closed)
- [ ] Payment fails in Razorpay
- [ ] Webhook fails and retries
- [ ] Invalid order ID error handling
- [ ] Network timeout handling
- [ ] Signature verification failure

### Edge Cases
- [ ] Duplicate payment attempts
- [ ] Partial payment (if applicable)
- [ ] Refund processing
- [ ] Payment status polling
- [ ] Large amount handling

## 📞 Support Resources

- **Razorpay Documentation**: https://razorpay.com/docs
- **Razorpay Dashboard**: https://dashboard.razorpay.com
- **Test Webhook**: https://webhook.site
- **Live Chat Support**: Available in Razorpay Dashboard

## 🚀 Go-Live Checklist

Before deploying to production:

1. **Code Review**
   - [ ] Security review completed
   - [ ] Error handling added
   - [ ] Logging configured properly
   - [ ] No hardcoded values

2. **Testing**
   - [ ] All test cases passed
   - [ ] Edge cases handled
   - [ ] Load testing done
   - [ ] Webhook testing verified

3. **Infrastructure**
   - [ ] Database backups configured
   - [ ] SSL certificates installed
   - [ ] Monitoring setup
   - [ ] Error alerts configured

4. **Documentation**
   - [ ] Team trained on system
   - [ ] Runbooks created
   - [ ] Support procedures documented
   - [ ] Incident response plan ready

5. **Legal & Compliance**
   - [ ] Terms of Service updated
   - [ ] Privacy Policy updated
   - [ ] Data retention policy set
   - [ ] Refund policy confirmed

## 📊 Monitoring & Metrics

Track these metrics post-launch:

- Total payments processed
- Average payment time
- Payment success rate
- Failed payment rate
- Average transaction amount
- Webhook delivery reliability
- Error rate and types
- Customer refund requests

## 📝 Notes

- Razorpay test mode doesn't charge actual cards
- Webhook retries happen if endpoint returns non-200 status
- Payment signatures must be verified on backend
- Keep detailed logs for audit purposes
- Monitor payment gateway status page for outages

---

**Status**: ✅ Implementation Complete | Ready for Configuration

Last Updated: April 7, 2026
