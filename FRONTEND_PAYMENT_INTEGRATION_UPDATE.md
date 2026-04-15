# Frontend Payment Integration Update Guide

**Status**: Backend Updated ✅  
**Date**: April 8, 2026

---

## 🔄 Backend API Changes

### 1️⃣ Create Order Endpoint (UPDATED)
**Endpoint**: `POST /api/payments/create-order`

**Request Body**:
```json
{
  "amount": 5000,
  "studentName": "John Doe",
  "studentId": "STU001",
  "invoiceId": "INV001",
  "totalAmount": 5000
}
```

**Response** (SUCCESS):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_1A2B3C4D5E6F",
    "amount": 500000,
    "currency": "INR",
    "razorpayKey": "rzp_live_xxxxxxxxxxxxx",
    "studentName": "John Doe",
    "studentId": "STU001",
    "invoiceId": "INV001"
  }
}
```

**What Changed**:
- ✅ Now returns real Order ID from Razorpay
- ✅ Includes `razorpayKey` (API Key) for frontend
- ✅ Amount is in paise (500000 = ₹5000)
- ✅ Currency always "INR"

---

### 2️⃣ Verify Payment Endpoint (NEW)
**Endpoint**: `POST /api/payments/verify` ← IMPORTANT: Different from before!

**Note**: Changed from `/verify-payment` to `/verify` for simplicity

**Request Body** (After Razorpay payment completes):
```json
{
  "orderId": "order_1A2B3C4D5E6F",
  "paymentId": "pay_1A2B3C4D5E6F",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  "studentId": "STU001",
  "amount": 5000
}
```

**Response** (SUCCESS):
```json
{
  "success": true,
  "message": "Payment verified successfully and fee payment updated",
  "data": {
    "success": true,
    "paymentStatus": "paid",
    "amountPaid": 5000,
    "totalAmount": 5000,
    "paymentDate": "2026-04-08T10:30:00Z",
    "transactionId": "pay_1A2B3C4D5E6F",
    "message": "Payment of ₹5000 recorded successfully. Fee status updated to 'paid'."
  }
}
```

**What Happens**:
- ✅ Verifies payment signature using HMAC-SHA256
- ✅ Updates FeePayment table: `paymentStatus = 'paid'`
- ✅ Stores `amountPaid` amount
- ✅ Records transaction ID
- ✅ Adds payment entry to payments array

**Database Update Logic**:
```sql
UPDATE "FeePayment" 
SET 
  paymentStatus = 'paid',
  amountPaid = {amount},
  payments = payments + [{
    amount: {amount},
    paymentDate: NOW(),
    paymentMethod: 'online',
    transactionId: {paymentId},
    notes: 'Razorpay Order: {orderId}'
  }]
WHERE student = {studentId}
```

---

## 🔧 Frontend Code Update Required

### Current Frontend Service Call (NEEDS UPDATE)

**File**: `src/services/paymentService.js`

Update the `processUPIPayment` function to match the new backend responses:

```javascript
export const processUPIPayment = async (paymentConfig, authToken) => {
  try {
    const { orderId, amount, studentName, studentId, invoiceId, totalAmount } = paymentConfig;

    // Step 1: Razorpay options
    const razorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      order_id: orderId,
      name: 'School Fee Payment',
      description: `Fee payment for ${studentName}`,
      prefill: {
        name: studentName,
      },
      notes: {
        studentId,
        invoiceId,
        orderId,
      },
      theme: {
        color: '#28a745',
      },
      method: {
        upi: true,
        card: false,
        netbanking: false,
        wallet: false,
      },
    };

    // Step 2: Initialize and wait for Razorpay payment
    const paymentResult = await initializeRazorpayPayment(razorpayOptions);

    // Step 3: Verify payment with backend using NEW /verify endpoint
    const verificationData = {
      orderId,
      paymentId: paymentResult.razorpay_payment_id,
      signature: paymentResult.razorpay_signature,
      studentId,
      amount: amount, // ← Send in rupees, not paise
    };

    // ← IMPORTANT: Changed from /verify-payment to /verify
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    const data = await response.json();

    return {
      success: true,
      paymentId: paymentResult.razorpay_payment_id,
      orderId,
      verifiedPayment: data.data,
    };
  } catch (error) {
    console.error('Error processing UPI payment:', error);
    throw error;
  }
};
```

---

## 🚀 Updated Payment Flow

```
1. User clicks "Pay"
   ↓
2. Frontend: GET Order ID
   POST /api/payments/create-order
   ← Returns: orderId, amount, currency, razorpayKey
   ↓
3. Frontend: Open Razorpay Checkout
   - Show UPI payment options
   - User selects UPI app (GooglePay, PhonePe, etc.)
   - User confirms on UPI app
   - Razorpay returns: paymentId, signature
   ↓
4. Frontend: VERIFY Payment
   POST /api/payments/verify
   Body: { orderId, paymentId, signature, studentId, amount }
   ← Returns: paymentStatus='paid', amountPaid, message
   ↓
5. Database: FeePayment table updated
   - paymentStatus = 'paid'
   - amountPaid = amount
   - Transaction logged
   ↓
6. Frontend: Show Success Page
   - Display payment confirmation
   - Show transaction details
   - Allow download receipt
```

---

## ✅ Testing Checklist

After updating your frontend code:

### Test 1: Create Order
```bash
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "studentName": "Test Student",
    "studentId": "STU001",
    "invoiceId": "INV001",
    "totalAmount": 100
  }'
```

Expected: Returns `orderId` from Razorpay

### Test 2: Verify Payment (with test signature)
```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "order_xxx",
    "paymentId": "pay_xxx",
    "signature": "test_signature",
    "studentId": "STU001",
    "amount": 100
  }'
```

Expected: Returns verification result and FeePayment update confirmation

### Test 3: Check Database
```javascript
// In MongoDB:
db.feepayments.findOne({ student: ObjectId("...") })
// Should show: paymentStatus="paid", amountPaid=100, payments=[...]
```

---

## 📝 Environment Variables (No Changes)

```env
# Backend .env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Frontend .env
VITE_RAZORPAY_KEY=rzp_live_xxxxx
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🔐 Security Details

### Database Update Logic (Backend)
The backend now properly:
1. ✅ Verifies HMAC-SHA256 signature
2. ✅ Checks studentId exists
3. ✅ Updates paymentStatus = 'paid'
4. ✅ Records amountPaid
5. ✅ Adds payment entry with timestamp
6. ✅ Logs transaction details

### Signature Verification
```
body = orderId|paymentId
expectedSignature = HMAC-SHA256(body, RAZORPAY_WEBHOOK_SECRET)
isValid = (expectedSignature === receivedSignature)
```

---

## 🐛 Troubleshooting

### Error: "Missing required fields"
**Solution**: Ensure you're sending all 5 fields: orderId, paymentId, signature, studentId, amount

### Error: "Payment signature verification failed"
**Solution**: 
- Check RAZORPAY_WEBHOOK_SECRET is correct in .env
- Verify signature is hex string
- Check orderId|paymentId format is exact

### Error: "Fee payment record not found for student"
**Solution**: 
- Ensure studentId is stored in MongoDB
- Check student exists in database
- Verify FeePayment record exists for this student

### Payment not showing in database
**Solution**:
- Check backend logs: `npm run dev`
- Verify /verify endpoint is being called
- Check MongoDB connection
- Verify student ObjectId format

---

## 📊 Response Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 201 | Order created | Proceed to checkout |
| 200 | Payment verified | Show success page |
| 400 | Bad request | Check request fields |
| 404 | Student not found | Verify studentId |
| 500 | Server error | Check backend logs |

---

## 🎯 Next Steps

1. ✅ Backend is updated
2. Update your frontend code with the new `/verify` endpoint
3. Test with Razorpay test credentials
4. Verify database updates
5. Deploy to production

---

**Backend Status**: ✅ READY  
**Frontend Status**: ⏳ NEEDS UPDATE  
**Testing Status**: Ready after frontend update

For questions, check the backend logs:
```bash
cd backend
npm run dev
```

Logs will show:
- ✅ Order created: ID=...
- ✅ Payment signature verified
- ✅ FeePayment updated: studentId=..., paymentStatus=paid
