# UPI Payment Implementation - Quick Reference Guide

## 🎯 Quick Start (5 Minutes)

### For Developers

```bash
# 1. Install Razorpay package
cd backend
npm install razorpay

# 2. Add environment variables to .env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# 3. Start backend server
npm start

# 4. Test endpoint
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "studentName": "John Doe",
    "studentId": "STU001",
    "invoiceId": "INV001",
    "totalAmount": 5000
  }'
```

---

## 📚 File Structure

```
backend/
├── config/
│   └── razorpay.js              # Razorpay initialization
├── services/
│   └── paymentService.js        # Payment business logic
├── controllers/
│   └── paymentController.js     # Payment API handlers
├── routes/
│   └── paymentRoutes.js         # Payment routes
└── server.js                    # Updated with payment routes

src/
├── services/
│   └── paymentService.js        # Frontend payment service
└── pages/
    └── Payment.jsx              # Updated with UPI integration
```

---

## 🔌 API Quick Reference

### Create Order
```
POST /api/payments/create-order
Body: {
  amount: number,           // in rupees
  studentName: string,
  studentId: string,
  invoiceId: string,
  totalAmount: number
}
Response: { orderId, amount, currency, ... }
```

### Verify Payment
```
POST /api/payments/verify-payment
Headers: Authorization: Bearer {token}
Body: {
  orderId, paymentId, signature,
  invoiceId, amount, studentId
}
Response: { paymentStatus, amountPaid, transactionId, ... }
```

### Webhook Handler
```
POST /api/payments/webhook
(Automatic - called by Razorpay)
Events: payment.authorized, payment.captured, payment.failed
```

### Get Payment Status
```
GET /api/payments/status/:paymentId
Headers: Authorization: Bearer {token}
Response: { paymentId, status, amount, method, vpa, ... }
```

### Refund Payment
```
POST /api/payments/refund
Headers: Authorization: Bearer {token}
Body: { paymentId, amount (optional) }
Response: { refundId, status, ... }
```

---

## 🛠️ Common Tasks

### Task 1: Handle UPI Payment
```javascript
import { processUPIPayment, createPaymentOrder } from '../services/paymentService'

// Create order first
const order = await createPaymentOrder({
  amount: 5000,
  studentName: 'John',
  studentId: 'STU001',
  invoiceId: 'INV001'
})

// Process payment
const result = await processUPIPayment({
  orderId: order.orderId,
  amount: 5000,
  studentName: 'John',
  studentId: 'STU001',
  invoiceId: 'INV001'
}, authToken)

// Redirect on success
navigate('/payment-success')
```

### Task 2: Verify Payment in Backend
```javascript
import PaymentService from '../services/paymentService'

const isValid = PaymentService.verifyPaymentSignature(
  { orderId, paymentId, signature },
  process.env.RAZORPAY_WEBHOOK_SECRET
)

if (isValid) {
  // Update database
  const result = await PaymentService.updateFeePaymentAfterSuccess({
    invoiceId, paymentId, amount, studentId, orderId
  })
}
```

### Task 3: Handle Payment Success
```javascript
const paymentData = {
  invoiceId,
  studentName,
  amount,
  paymentMethod: 'UPI',
  transactionId: paymentResult.paymentId,
  orderId: paymentResult.orderId,
  status: 'Paid'
}

sessionStorage.setItem('paymentData', JSON.stringify(paymentData))
navigate('/payment-success')
```

### Task 4: Handle Payment Failure
```javascript
try {
  const result = await processUPIPayment(paymentConfig, token)
} catch (error) {
  setFormError(error.message)
  // Log error, notify user
  console.error('Payment failed:', error)
}
```

---

## 🧪 Test Credentials

### Test UPI IDs
```
Success: success@okhdfcbank
Failure: failure@okhdfcbank
Pending: pending@okhdfcbank
```

### Test Card Numbers
```
Visa:      4111111111111111
Mastercard: 5555555555554444
Amex:      378282246310005
```

### Test Expiry & CVV
```
Expiry: Any future date (MM/YY)
CVV:    Any 3-4 digit number
```

---

## 📊 Database Fields

### fee_payments Table
```sql
-- Key payment fields
payment_status    VARCHAR -- Pending/Paid/Failed
payment_method    VARCHAR -- UPI/Card/NetBanking
payment_gateway   VARCHAR -- Razorpay
transaction_id    VARCHAR -- Payment gateway ID
order_id         VARCHAR -- Order reference
vpa              VARCHAR -- UPI ID
amount_paid      DECIMAL -- Actual paid amount
total_amount     DECIMAL -- Total fee amount
payment_date     TIMESTAMP -- When payment happened
```

---

## ⚡ Performance Tips

1. **Cache Order IDs**: Don't recreate orders for same amount
2. **Batch Webhook Processing**: Process webhooks asynchronously
3. **Database Indexes**: Add index on `transaction_id` and `order_id`
4. **API Rate Limiting**: Limit payment creation to prevent abuse
5. **Timeout Handling**: Set reasonable timeouts (15 mins = 900s)

---

## 🐛 Debugging Tips

### Issue: Razorpay script not loading
```javascript
// Check in browser console
console.log('Razorpay' in window)  // Should be true
```

### Issue: Payment verification fails
```javascript
// Verify signature with correct secret
const expectedSig = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex')

console.log('Expected:', expectedSig)
console.log('Actual:', signature)
console.log('Match:', expectedSig === signature)
```

### Issue: Webhook not being received
```javascript
// Check in Razorpay Dashboard
// Settings → Webhooks → View webhook attempts
// Verify endpoint is publicly accessible
// Check for 200 response code
// Monitor server logs
```

### Issue: Amount mismatch
```javascript
// Remember: Razorpay uses PAISE (1 INR = 100 PAISE)
const amountInPaise = amount * 100
console.log('Sending to Razorpay:', amountInPaise)
```

---

## 🔒 Security Checklist

- [ ] Secret keys in .env, not in code
- [ ] .env in .gitignore
- [ ] Always verify signatures on backend
- [ ] HTTPS for all production endpoints
- [ ] Rate limiting on payment endpoints
- [ ] Proper error messages (don't expose secrets)
- [ ] Log transactions without sensitive data
- [ ] Regular security audits

---

## 📈 Success Metrics to Track

```javascript
// Track these metrics
const metrics = {
  totalTransactions: 0,
  successfulPayments: 0,
  failedPayments: 0,
  averageAmount: 0,
  successRate: 0,        // (successful / total) * 100
  avgProcessingTime: 0,  // milliseconds
  webhookFailures: 0,
  refundCount: 0
}
```

---

## 🚨 Error Codes & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Order creation failed | Invalid API key | Check RAZORPAY_KEY_ID in .env |
| Signature verification failed | Wrong webhook secret | Verify RAZORPAY_WEBHOOK_SECRET |
| Payment not found | Order mismatch | Check orderId is from current order |
| Invoice not found | Invalid invoiceId | Verify invoiceId exists in DB |
| Amount exceeds limit | Amount too large | Check Razorpay account limits |

---

## 📞 Support Resources

| Resource | URL |
|----------|-----|
| Razorpay Docs | https://razorpay.com/docs |
| API Reference | https://razorpay.com/docs/api |
| Test Webhook | https://webhook.site |
| Community | https://razorpay.com/forum |
| Status Page | https://status.razorpay.com |

---

## 🎓 Learning Path

1. **Understand Payment Flow** (5 min)
   - Read: `UPI_PAYMENT_SETUP_GUIDE.md` Part 1-2

2. **Setup Razorpay Account** (15 min)
   - Follow: `UPI_PAYMENT_SETUP_GUIDE.md` Part 1

3. **Configure Environment** (10 min)
   - Follow: `UPI_PAYMENT_SETUP_GUIDE.md` Part 2-3

4. **Test Payment Flow** (20 min)
   - Follow: `UPI_PAYMENT_SETUP_GUIDE.md` Part 8

5. **Deploy to Production** (30 min)
   - Follow: `UPI_PAYMENT_SETUP_GUIDE.md` Part 9

---

## 💡 Pro Tips

1. **Test with small amounts**: Start with ₹1 transactions
2. **Monitor webhooks**: Use webhook.site for testing
3. **Keep logs**: Enable detailed logging for debugging
4. **Handle retries**: Implement exponential backoff
5. **Partial payments**: Consider if applicable for your use case
6. **Reconciliation**: Daily reconciliation with Razorpay
7. **Notifications**: Send email/SMS on payment success
8. **Documentation**: Keep transaction history for audit

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema updated
- [ ] All dependencies installed
- [ ] Tests passing
- [ ] Webhook endpoint working
- [ ] Error handling complete
- [ ] Logging configured
- [ ] Security review done
- [ ] Documentation updated
- [ ] Team trained

---

**Questions?** Check `UPI_PAYMENT_SETUP_GUIDE.md` or contact support at Razorpay Dashboard.

Last Updated: April 7, 2026
