# Payment System Testing Guide

**Date**: April 8, 2026  
**How to verify if payments are working**

---

## ✅ Step 1: Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Server is running on port 5000
✅ Database connected
```

---

## ✅ Step 2: Test CREATE ORDER Endpoint

Use this command to test order creation (works in PowerShell):

### Option A: Using PowerShell (Windows)

```powershell
$body = @{
    amount = 100
    studentName = "Test Student"
    studentId = "STU001"
    invoiceId = "INV001"
    totalAmount = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/payments/create-order" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body | Select-Object -ExpandProperty Content
```

### Option B: Using curl (simpler)

```bash
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d "{\"amount\":100,\"studentName\":\"Test Student\",\"studentId\":\"STU001\",\"invoiceId\":\"INV001\",\"totalAmount\":100}"
```

### Expected Response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_1A2B3C4D5E6F",
    "amount": 10000,
    "currency": "INR",
    "razorpayKey": "rzp_live_xxxxxxxxxxxxx",
    "studentName": "Test Student",
    "studentId": "STU001",
    "invoiceId": "INV001"
  }
}
```

**✅ If you see this**: Order creation is WORKING! ✓

**❌ If you get error**: Check backend logs for details

---

## ✅ Step 3: Check Backend Logs

In your running terminal, look for these messages:

```
✅ Order created successfully: order_1A2B3C4D5E6F
✅ Razorpay order created: ID=order_1A2B3C4D5E6F, Amount=10000 paise
```

**Good signs**:
- ✅ "Order created successfully"
- ✅ Order ID starting with "order_"
- ✅ Amount in paise (100 rupees = 10000 paise)

**Bad signs**:
- ❌ "Error creating Razorpay order"
- ❌ "Missing required fields"
- ❌ API key errors

---

## ✅ Step 4: Test VERIFY PAYMENT Endpoint

After you have an orderId, test payment verification:

### Using curl:

```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "{\"orderId\":\"order_1A2B3C4D5E6F\",\"paymentId\":\"pay_1A2B3C4D5E6F\",\"signature\":\"test_signature_123\",\"studentId\":\"STU001\",\"amount\":100}"
```

**Note**: The signature will likely fail because it's a test signature, but you'll see if the endpoint is working:

### Expected Response (Signature Validation):
```json
{
  "success": false,
  "message": "Payment signature verification failed. Payment not valid."
}
```

**✅ This is GOOD!** It means:
- Endpoint is working
- Signature verification is active
- Security is in place

---

## ✅ Step 5: Check Backend Logs for Signature Verification

Look for these logs:

```
❌ Payment signature INVALID for payment pay_1A2B3C4D5E6F
Expected: abc123..., Got: test_signature_123
```

**✅ This is perfect!** It shows signature verification is working.

---

## ✅ Step 6: Test with Real Razorpay Signature

To test with a REAL signature, you need to:

1. **Get order ID** from create-order endpoint ✅
2. **Process payment** in Razorpay checkout
3. **Razorpay returns** paymentId + signature
4. **Send to verify endpoint** with real values

### Quick Test (Simulated):

For now, just verify the endpoints are responding correctly:

```bash
# Test 1: Create Order
curl http://localhost:5000/api/payments/create-order \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"studentName":"Test","studentId":"STU001","invoiceId":"INV001","totalAmount":100}'

# You should get: { "success": true, "data": { "orderId": "..." } }
```

---

## ✅ Step 7: Check Database

To verify database updates are working:

### Using MongoDB Compass or Mongosh:

```javascript
// Connect to MongoDB
mongosh "mongodb://localhost:27017/fee-management"

// Check FeePayment records
db.feepayments.findOne({ student: ObjectId("...") })

// You should see:
{
  _id: ObjectId("..."),
  student: ObjectId("..."),
  paymentStatus: "paid",
  amountPaid: 100,
  payments: [
    {
      amount: 100,
      paymentDate: ISODate("2026-04-08T10:30:00Z"),
      paymentMethod: "online",
      transactionId: "pay_1A2B3C4D5E6F"
    }
  ]
}
```

---

## ✅ Step 8: Full Payment Flow Test

### Step 1: Create Order
```bash
# Terminal 1: Backend running
npm run dev

# Terminal 2: Test endpoint
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"studentName":"John Doe","studentId":"STU001","invoiceId":"INV001","totalAmount":5000}'
```

Expected output:
```json
{
  "orderId": "order_xyz123"
}
```

Copy the `orderId` from response.

### Step 2: Open Razorpay Checkout (Frontend)

Your frontend should:
1. Get the orderId from backend ✓
2. Open Razorpay with UPI method ✓
3. Show payment checkout

### Step 3: Complete Payment in Razorpay

When you complete payment, you'll get:
- `paymentId`: "pay_xyz123"
- `signature`: "abc123..."

### Step 4: Verify Payment

```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "orderId": "order_xyz123",
    "paymentId": "pay_xyz123",
    "signature": "abc123...",
    "studentId": "STU001",
    "amount": 5000
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Payment verified successfully and fee payment updated",
  "data": {
    "paymentStatus": "paid",
    "amountPaid": 5000
  }
}
```

---

## 🔍 Checklist: Payment Working?

- [ ] **Step 1**: `npm run dev` starts without errors
- [ ] **Step 2**: Create order returns `orderId`
- [ ] **Step 3**: Backend logs show "Order created successfully"
- [ ] **Step 4**: Verify endpoint responds (even if signature fails)
- [ ] **Step 5**: Signature verification is active
- [ ] **Step 6**: Database updates work
- [ ] **Step 7**: All status codes are 200/201

If ALL are checked ✅ → **YOUR PAYMENT SYSTEM IS WORKING!**

---

## 🐛 Troubleshooting

### Problem 1: "Cannot connect to http://localhost:5000"
**Solution**:
```bash
# Check if backend is running
cd backend
npm run dev

# Should see: "Server is running on port 5000"
```

### Problem 2: "Missing RAZORPAY_KEY_ID"
**Solution**:
```bash
# Check .env file exists
cat .env

# Should have:
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

### Problem 3: "Error creating Razorpay order"
**Solution**:
- Check API keys are correct in `.env`
- Check internet connection
- Check Razorpay account is active
- Check logs for exact error

### Problem 4: Database not updating
**Solution**:
```bash
# Check MongoDB is running
mongosh

# Check database exists
show dbs
use fee-management
db.feepayments.count()

# Should return number > 0
```

---

## 📊 Testing Summary

| Test | Command | Expected Result | Status |
|------|---------|-----------------|--------|
| Backend starts | `npm run dev` | Port 5000 listening | ✅ |
| Create order | `POST /create-order` | orderId returned | ✅ |
| Verify endpoint | `POST /verify` | Response received | ✅ |
| Signature check | Logs | "INVALID" or "VERIFIED" | ✅ |
| Database | MongoDB query | payment recorded | ✅ |

---

## 🚀 Quick Test Script

Save this as `test-payment.sh`:

```bash
#!/bin/bash

echo "Testing Payment System..."
echo ""

echo "1. Testing Create Order Endpoint"
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"studentName":"Test","studentId":"STU001","invoiceId":"INV001","totalAmount":100}' \
  | python -m json.tool

echo ""
echo "2. Backend Health Check"
curl http://localhost:5000/health | python -m json.tool

echo ""
echo "✅ Test Complete"
```

Run it:
```bash
bash test-payment.sh
```

---

## 📱 Frontend Integration Test

Once backend is working, test frontend:

1. **Open frontend**: http://localhost:5173
2. **Navigate to payment page**
3. **Select UPI method** (should be default)
4. **Click Pay button**
5. **Watch network tab** in browser DevTools (F12)
   - You should see POST to `/create-order`
   - Should return orderId
6. **Razorpay checkout opens** (or error shows)
7. **Complete test payment**
8. **Check database** for payment record

---

## ✅ What "Working" Looks Like

### Backend Console:
```
✅ Server is running on port 5000
✅ Database connected
✅ Razorpay SDK initialized

POST /api/payments/create-order
✅ Order created successfully: order_1A2B3C4D5E6F
✅ Razorpay order created: ID=order_1A2B3C4D5E6F, Amount=10000 paise

POST /api/payments/verify
✅ Verifying payment: pay_1A2B3C4D5E6F for student: STU001
✅ Payment signature verified for payment pay_1A2B3C4D5E6F
✅ FeePayment updated: studentId=STU001, paymentStatus=paid, amountPaid=100
```

### Database:
```javascript
{
  student: ObjectId("..."),
  paymentStatus: "paid",
  amountPaid: 100,
  payments: [{ transactionId: "pay_..." }]
}
```

### Frontend:
```
✅ Payment Success Page
  - Transaction ID: pay_1A2B3C4D5E6F
  - Amount: ₹100
  - Status: Paid
```

---

## 🎯 Summary

**To check if payment is working**:

1. ✅ Start backend
2. ✅ Call `/create-order` endpoint
3. ✅ Check logs for success
4. ✅ Call `/verify` endpoint
5. ✅ Check database for updates

If all work → **PAYMENT SYSTEM IS OPERATIONAL! 🎉**

---

Need help? Check:
- Backend logs: `npm run dev`
- `.env` file: API keys present?
- MongoDB: Running and connected?
- Network: `curl http://localhost:5000/health`

You're doing great! 🚀
