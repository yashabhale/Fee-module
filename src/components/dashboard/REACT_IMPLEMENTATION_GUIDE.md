# Financial Dashboard - React Implementation Guide

## Overview

This guide shows you how to use the comprehensive financial dashboard components with your backend API.

---

## 📁 Component Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── FinancialDashboard.jsx          ← Main dashboard container
│   │   ├── FinancialDashboard.css          ← Dashboard styles
│   │   ├── TransactionsTable.jsx           ← Transactions table
│   │   ├── TransactionsTable.css           ← Table styles
│   │   ├── DashboardMetrics.jsx            ← Metric cards
│   │   └── DashboardMetrics.css            ← Metric styles
│   └── charts/
│       ├── MonthlyFeeChart.jsx             ← Bar chart (UPDATED)
│       ├── PaymentMethodChart.jsx          ← Pie chart (UPDATED)
│       └── Charts.css
├── pages/
│   └── Dashboard.jsx                       ← Page layout
└── services/
    └── dashboardService.js                 ← (Optional) API calls
```

---

## 🚀 Quick Setup

### Step 1: Check Environment Variables

Ensure your `.env` file has:
```
VITE_API_URL=http://localhost:5000
```

### Step 2: Update Your Routes

In `src/App.jsx` or your routing setup:

```javascript
import FinancialDashboard from './components/dashboard/FinancialDashboard';

// In your routes
<Route path="/dashboard" element={<FinancialDashboard />} />
```

### Step 3: Verify Dependencies

All required dependencies are already in your `package.json`:
- ✅ `recharts` - For charts
- ✅ `axios` - For API calls
- ✅ `react-router-dom` - For navigation
- ✅ `tailwindcss` - For styling

---

## 💡 Component Features

### FinancialDashboard.jsx
**Main container component that:**
- Fetches data from backend API endpoint
- Manages loading/error states
- Displays year selector dropdown
- Passes data to child components
- Handles navigation for Receipt button

**Props:** None (manages its own state)

**Data Flow:**
```
Backend API 
    ↓
FinancialDashboard (fetches & manages data)
    ├── DashboardMetrics (displays KPIs)
    ├── MonthlyFeeChart (Bar chart)
    ├── PaymentMethodChart (Pie chart)
    └── TransactionsTable (Recent transactions)
```

---

### TransactionsTable.jsx
**Displays recent transactions with:**
- Student name & ID
- Invoice number
- Class name
- Amount (formatted currency)
- Payment method (badge)
- Status (colored badge)
- Receipt/Pay button

**Props:**
```javascript
<TransactionsTable
  transactions={[
    {
      id: '1',
      studentName: 'John Doe',
      studentId: 'STU001',
      invoiceNo: 'INV-2024-001',
      class: 'Class 12-A',
      amount: 50000,
      method: 'BANK_TRANSFER',
      status: 'PAID',
      transactionDate: '2024-03-28T10:30:00Z'
    }
  ]}
  onReceiptClick={(transaction) => { /* handle click */ }}
/>
```

---

### DashboardMetrics.jsx
**Displays 3 KPI cards:**
- Total Collected (₹)
- Total Transactions (count)
- Average Transaction Amount (₹)

**Props:**
```javascript
<DashboardMetrics
  summary={{
    totalCollected: 875000,
    totalTransactions: 95,
    averageTransactionAmount: 9210.53
  }}
/>
```

---

### Updated Chart Components

#### MonthlyFeeChart.jsx
Accepts both old and new data formats:

```javascript
// Backend API format
data={[
  { month: 1, monthName: 'Jan', amount: 50000 },
  { month: 2, monthName: 'Feb', amount: 65000 },
  // ... rest of months
]}

// Legacy format (still compatible)
data={[
  { month: 'Jan', collected: 50000 },
  { month: 'Feb', collected: 65000 },
]}
```

#### PaymentMethodChart.jsx
Accepts both formats with custom tooltip:

```javascript
// Backend API format
data={[
  { method: 'BANK_TRANSFER', count: 45, totalAmount: 450000 },
  { method: 'ONLINE', count: 30, totalAmount: 300000 },
]}

// Legacy format (still compatible)
data={[
  { name: 'Card', value: 45 },
  { name: 'UPI', value: 30 },
]}
```

---

## 🔌 API Integration

### Backend Endpoint Expected

```
GET /api/fee-payments/dashboard?year=2024

Headers:
- Authorization: Bearer {token}
- Content-Type: application/json

Response:
{
  "success": true,
  "message": "Financial dashboard data retrieved successfully",
  "data": {
    "year": 2024,
    "monthlyCollection": {
      "title": "Monthly Fee Collection",
      "data": [
        { "month": 1, "monthName": "Jan", "amount": 50000 },
        // ... 11 more months
      ],
      "totalCollected": 875000
    },
    "paymentMethodDistribution": {
      "title": "Payment Method Distribution",
      "data": [
        { "method": "BANK_TRANSFER", "count": 45, "totalAmount": 450000 },
        { "method": "ONLINE", "count": 30, "totalAmount": 300000 },
        { "method": "CASH", "count": 20, "totalAmount": 125000 }
      ],
      "total": 95
    },
    "recentTransactions": {
      "title": "Recent Transactions",
      "data": [
        {
          "id": "p1",
          "studentName": "John Doe",
          "studentId": "STU001",
          "invoiceNo": "INV-2024-001",
          "class": "Class 12-A",
          "amount": 50000,
          "method": "BANK_TRANSFER",
          "status": "PAID",
          "transactionDate": "2024-03-28T10:30:00Z"
        }
        // ... 4 more transactions
      ],
      "count": 5
    },
    "summary": {
      "totalCollected": 875000,
      "totalTransactions": 95,
      "averageTransactionAmount": 9210.53
    }
  }
}
```

---

## 📱 Responsive Design

Components are fully responsive:

- **Desktop** (1920px+): 2-column chart grid, full table
- **Tablet** (768px-1199px): Adjusted spacing, readable charts
- **Mobile** (480px-767px): Single column, compact table
- **Small Mobile** (<480px): Optimized for small screens

---

## 🎨 Color Scheme

### Green Theme (Primary)
- Light background: `#f0fdf4`
- Primary green: `#22c55e`
- Dark green: `#15803d`

### Supporting Colors
- Blue: `#0284c7` (for payment methods)
- Emerald: `#10b981` (for average amounts)
- Orange: `#f59e0b` (for warnings)
- Red: `#ef4444` (for errors/overdue)

---

## 🚦 Status Badge Colors

```
PAID      → Green (#d1fae5)
PENDING   → Amber (#fef3c7)
PARTIAL   → Cyan (#cffafe)
OVERDUE   → Red (#fee2e2)
```

---

## 🔄 Data Flow Example

### 1. User visits dashboard
```
FinancialDashboard component mounts
  ↓
useEffect hook triggers
  ↓
Fetch from /api/fee-payments/dashboard?year=2024
  ↓
API returns data
  ↓
setDashboardData updates state
  ↓
Component re-renders with new data
```

### 2. Charts receive data
```
monthlyCollection.data
  ↓
MonthlyFeeChart transforms it
  ↓
Bar chart renders with 12 months
```

### 3. Transactions table populated
```
recentTransactions.data
  ↓
TransactionsTable maps each transaction
  ↓
Renders table rows with formatted data
```

---

## 🛠️ Customization

### Change Colors
Edit `FinancialDashboard.css` and component CSS files:

```css
/* Change primary green to blue */
.btn-outline {
  border: 1px solid #0284c7;  /* was #22c55e */
  color: #0284c7;
}

.btn-outline:hover {
  background: #0284c7;
}
```

### Modify Table Columns
Edit `TransactionsTable.jsx`:

```javascript
// Remove or add columns in the return statement
<th>Custom Column</th>
<td>{transaction.customField}</td>
```

### Change Chart Types
Update chart imports in `FinancialDashboard.jsx`:

```javascript
// Change Bar to Line chart
import { LineChart } from 'recharts';
// Update component
<LineChart data={monthlyChartData} />
```

---

## 🔍 Error Handling

The dashboard includes:

1. **API Error Handling**
```javascript
try {
  const response = await axios.get(...);
  if (response.data.success) {
    setDashboardData(response.data.data);
  }
} catch (err) {
  setError(err.response?.data?.message);
  // Falls back to mock data in development
  setDashboardData(getMockData());
}
```

2. **Loading State**
```javascript
if (loading) return <div>Loading...</div>;
```

3. **Error Display**
```javascript
if (error && !dashboardData) return <div>Error...</div>;
```

---

## 🧪 Testing Data

For development, mock data is provided in `FinancialDashboard.jsx`:

```javascript
const getMockData = () => ({
  year: 2024,
  monthlyCollection: { ... },
  paymentMethodDistribution: { ... },
  recentTransactions: { ... },
  summary: { ... }
});
```

This automatically activates if:
- API call fails
- Internet connection is lost
- Backend is down

---

## 📊 Integrating with Receipt/Payment Pages

When clicking Receipt button:

```javascript
const handleReceiptClick = (transaction) => {
  if (transaction.status === 'PAID') {
    // Navigate to Receipt page
    navigate(`/receipt/${transaction.id}`, { 
      state: { transaction } 
    });
  } else {
    // Navigate to Payment page
    navigate(`/payment/${transaction.id}`, { 
      state: { transaction } 
    });
  }
};
```

Update your Receipt and Payment pages to:
```javascript
import { useLocation } from 'react-router-dom';

const ReceiptPage = () => {
  const { state } = useLocation();
  const { transaction } = state;
  
  return (
    <div>
      <h1>Receipt for {transaction.studentName}</h1>
      {/* Display receipt details */}
    </div>
  );
};
```

---

## 🚀 Performance Optimization Tips

1. **Memoize Chart Components**
```javascript
export default React.memo(MonthlyFeeChart);
```

2. **Use useMemo for Data Transformation**
```javascript
const chartData = useMemo(() => {
  return transformData(data);
}, [data]);
```

3. **Implement Pagination for Transactions**
```javascript
const [page, setPage] = useState(1);
const itemsPerPage = 10;
const paginatedData = recentTransactions.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
);
```

4. **Add Caching**
```javascript
const [cache, setCache] = useState({});

useEffect(() => {
  const cacheKey = `dashboard-${selectedYear}`;
  if (cache[cacheKey]) {
    setDashboardData(cache[cacheKey]);
  } else {
    // Fetch from API and cache
  }
}, [selectedYear, cache]);
```

---

## 🐛 Troubleshooting

### Charts not displaying
- Check if data is being fetched
- Verify chart component imports
- Check browser console for errors

### Mock data showing instead of API data
- Check if token is properly set in localStorage
- Verify API endpoint URL in .env file
- Check backend is running on correct port

### Table not showing transactions
- Verify recentTransactions.data exists in response
- Check if transactions array is empty
- Ensure all required fields are present

### Styling issues
- Clear browser cache (Ctrl+Shift+Delete)
- Check Tailwind CSS is properly configured
- Verify CSS files are imported

---

## 📚 Related Files

- Backend: `FINANCIAL_DASHBOARD_IMPLEMENTATION.md`
- Database Setup: `DATABASE_SETUP_AND_TESTING.md`
- API Reference: Backend documentation

---

## ✅ Checklist

- [ ] All components created in correct folders
- [ ] CSS files created for both new components
- [ ] Chart components updated
- [ ] Environment variables configured
- [ ] Routes registered in main app
- [ ] Backend API endpoint operational
- [ ] Mock data working (for testing)
- [ ] Charts displaying data correctly
- [ ] Transactions table showing data
- [ ] Receipt button navigates properly
- [ ] Responsive design works on mobile
- [ ] Error handling working

---

## 🎯 Next Steps

1. **Deploy components** to your application
2. **Test with backend** API
3. **Customize colors** to match brand
4. **Add additional features** (export, filters, etc.)
5. **Performance test** with real data
6. **Deploy to production**

---

For detailed API documentation, see: `FINANCIAL_DASHBOARD_IMPLEMENTATION.md`
