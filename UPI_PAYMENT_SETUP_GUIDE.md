# UPI Payment Implementation - Environment & Setup Guide

## Overview
This guide explains how to set up the UPI payment flow using Razorpay for your school fee management system.

---

## Part 1: Razorpay Account Setup

### 1. Create a Razorpay Account
1. Go to [Razorpay.com](https://razorpay.com)
2. Sign up with your business details
3. Complete KYC verification
4. Access your Dashboard

### 2. Get API Keys
1. Log in to Razorpay Dashboard
2. Navigate to **Settings** → **API Keys**
3. Copy your:
   - **Key ID** (Public Key)
   - **Key Secret** (Secret Key)

---

## Part 2: Backend Environment Variables

Add these variables to your `.env` file in the `/backend` directory:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_CURRENCY=INR
RAZORPAY_TIMEOUT=900

# Webhook Configuration
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fee_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### Setting up Webhook Secret
1. In Razorpay Dashboard, go to **Settings** → **Webhooks**
2. Click **Add New Webhook Endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/payments/webhook`
4. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
5. Copy the generated **Webhook Secret**

---

## Part 3: Frontend Environment Variables

Add these to your `.env` file in the root directory (Fee_module):

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY=your_razorpay_key_id_here

# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Part 4: Install Required Dependencies

### Backend
```bash
cd backend
npm install razorpay
npm install dotenv
```

### Frontend
No additional dependencies needed - Razorpay script loads dynamically.

---

## Part 5: Database Schema Updates

The FeePayment table should have these fields for payment tracking:

```sql
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(100) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Paid, Partial, Failed
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50), -- Razorpay, Stripe, etc.
    transaction_id VARCHAR(100), -- Payment gateway transaction ID
    order_id VARCHAR(100), -- Razorpay order ID
    vpa VARCHAR(100), -- UPI ID used for payment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

---

## Part 6: API Endpoints

### 1. Create Payment Order
**POST** `/api/payments/create-order`

**Request:**
```json
{
  "amount": 5000,
  "studentName": "John Doe",
  "studentId": "STU001",
  "invoiceId": "INV001",
  "totalAmount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_1234567890",
    "amount": 500000,
    "currency": "INR",
    "studentName": "John Doe",
    "studentId": "STU001",
    "invoiceId": "INV001"
  }
}
```

### 2. Verify Payment
**POST** `/api/payments/verify-payment` (Requires Authentication)

**Request:**
```json
{
  "orderId": "order_1234567890",
  "paymentId": "pay_1234567890",
  "signature": "signature_hash",
  "invoiceId": "INV001",
  "amount": 500000,
  "studentId": "STU001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and recorded successfully",
  "data": {
    "invoiceId": "INV001",
    "paymentStatus": "Paid",
    "amountPaid": 5000,
    "totalAmount": 5000,
    "transactionId": "pay_1234567890",
    "paymentDate": "2026-04-07T10:30:00Z"
  }
}
```

### 3. Webhook Endpoint
**POST** `/api/payments/webhook`

Razorpay will send payment updates to this endpoint automatically.

### 4. Get Payment Status
**GET** `/api/payments/status/:paymentId` (Requires Authentication)

**Response:**
```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "paymentId": "pay_1234567890",
    "status": "captured",
    "amount": 500000,
    "currency": "INR",
    "method": "upi",
    "vpa": "student@googlepay",
    "createdAt": "2026-04-07T10:30:00Z"
  }
}
```

---

## Part 7: Frontend Implementation

### Payment Flow in React Component

```javascript
import { processUPIPayment, createPaymentOrder } from '../services/paymentService'

// Step 1: Create order
const orderData = await createPaymentOrder({
  amount: 5000,
  studentName: 'John Doe',
  studentId: 'STU001',
  invoiceId: 'INV001'
})

// Step 2: Trigger Razorpay payment
const paymentResult = await processUPIPayment(
  {
    orderId: orderData.orderId,
    amount: 5000,
    studentName: 'John Doe',
    studentId: 'STU001',
    invoiceId: 'INV001'
  },
  authToken
)

// Step 3: Handle success
if (paymentResult.success) {
  // Payment successful, navigate to success page
  navigate('/payment-success')
}
```

---

## Part 8: Testing

### Test Credentials (Razorpay Test Mode)

**Card Numbers:**
- Visa: `4111111111111111`
- Mastercard: `5555555555554444`
- Amex: `378282246310005`

**UPI IDs (Test):**
- `success@okhdfcbank`
- `failure@okhdfcbank`
- `pending@okhdfcbank`

**CVV/Expiry:** Any future date and any 3-4 digit CVV

### Manual Testing Steps

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Navigate to Payment page**

4. **Select UPI method and click Pay**

5. **Complete payment with test credentials**

6. **Verify payment in Razorpay Dashboard:**
   - Log in to Razorpay Dashboard
   - Go to **Transactions** → **Payments**
   - Search for your test payment

---

## Part 9: Production Deployment

### Before Going Live

1. **Activate Live Mode in Razorpay:**
   - In Dashboard, enable Live Mode
   - Get Live API keys

2. **Update Environment Variables:**
   ```env
   RAZORPAY_KEY_ID=live_key_id
   RAZORPAY_KEY_SECRET=live_key_secret
   NODE_ENV=production
   ```

3. **Setup Webhook on Live Domain:**
   - Configure webhook for production URL
   - Test webhook delivery

4. **Enable HTTPS:**
   - All payment endpoints must be HTTPS

5. **Test with Small Amounts:**
   - Make a real transaction with small amount
   - Verify payment in database

---

## Part 10: Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Razorpay script not loaded" | Ensure Razorpay script loads in useEffect |
| "Payment verification failed" | Check webhook secret in .env |
| "Order creation failed" | Verify API key is correct in request |
| "Payment not reflecting in DB" | Check webhook endpoint is receiving events |
| "CORS errors" | Add frontend URL to server CORS configuration |

### Debug Logs

Check these files for logs:
- Backend: `backend/logs/` directory
- Browser Console: Press F12 in browser
- Razorpay Dashboard: Payment transaction details

---

## Part 11: Security Best Practices

1. **Never expose Secret Key:**
   - Only use in backend
   - Never commit .env to version control

2. **Always verify signatures:**
   - On webhook: Verify HMAC signature
   - On frontend: Verify response signature

3. **Use HTTPS:**
   - All production APIs must be HTTPS
   - Webhook URLs must be HTTPS

4. **Validate amounts:**
   - Never trust client-side amount validation
   - Always verify on backend

5. **Log transactions:**
   - Keep detailed logs of all payments
   - Monitor for suspicious patterns

---

## Part 12: Support & Resources

- **Razorpay Docs:** https://razorpay.com/docs
- **Payment Gateway:** https://dashboard.razorpay.com
- **Webhook Tester:** https://webhook.site (for testing webhooks)
- **Community Forums:** https://razorpay.com/forum

---

## Database Fields Reference

The FeePayment table tracks these payment fields:

| Field | Type | Purpose |
|-------|------|---------|
| `invoice_id` | VARCHAR | Links to fee invoice |
| `student_id` | INT | References student |
| `total_amount` | DECIMAL | Total fee amount |
| `amount_paid` | DECIMAL | Actual paid amount |
| `payment_status` | VARCHAR | Pending/Paid/Failed |
| `transaction_id` | VARCHAR | Razorpay payment ID |
| `order_id` | VARCHAR | Razorpay order ID |
| `vpa` | VARCHAR | UPI ID used |
| `payment_method` | VARCHAR | UPI/Card/NetBanking |
| `payment_gateway` | VARCHAR | Razorpay/Stripe |
| `created_at` | TIMESTAMP | Transaction time |

---

## Next Steps

1. ✅ Set up Razorpay account
2. ✅ Add environment variables
3. ✅ Install dependencies
4. ✅ Update database schema
5. ✅ Test payment flow
6. ✅ Deploy to production

Good luck with your UPI payment implementation!
