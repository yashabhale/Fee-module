# React Dashboard - Copy-Paste Ready Examples

## 🚀 Quick Integration Examples

### Example 1: Basic Route Setup

**In `src/App.jsx`:**
```javascript
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import FinancialDashboard from './components/dashboard/FinancialDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Other routes */}
        <Route path="/dashboard" element={<FinancialDashboard />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
```

---

### Example 2: Page Layout with Dashboard

**In `src/pages/Dashboard.jsx`:**
```javascript
import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Sidebar from '../components/sidebar/Sidebar';
import FinancialDashboard from '../components/dashboard/FinancialDashboard';

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <FinancialDashboard />
        </main>
      </div>
    </div>
  );
}
```

---

### Example 3: With Custom Navigation Click Handler

**In `src/pages/Dashboard.jsx`:**
```javascript
import React, { useState } from 'react';
import FinancialDashboard from '../components/dashboard/FinancialDashboard';

export default function DashboardPage() {
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleReceiptClick = (transaction) => {
    // Custom logic before navigation
    setSelectedTransaction(transaction);
    
    if (transaction.status === 'PAID') {
      // Navigate to receipt
      window.location.href = `/receipt/${transaction.id}`;
    } else {
      // Navigate to payment
      window.location.href = `/payment/${transaction.id}`;
    }
  };

  return (
    <div>
      <FinancialDashboard />
      {selectedTransaction && (
        <div className="transaction-details">
          <h4>Selected: {selectedTransaction.studentName}</h4>
        </div>
      )}
    </div>
  );
}
```

---

### Example 4: Dashboard with Error Boundary

**In `src/pages/Dashboard.jsx`:**
```javascript
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import FinancialDashboard from '../components/dashboard/FinancialDashboard';

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <FinancialDashboard />
    </ErrorBoundary>
  );
}

// ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### Example 5: Custom Dashboard Service

**In `src/services/dashboardService.js`:**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const dashboardService = {
  /**
   * Fetch financial dashboard data
   * @param {number} year - Year to fetch data for
   * @returns {Promise<object>} Dashboard data
   */
  async getFinancialDashboard(year = new Date().getFullYear()) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/fee-payments/dashboard`,
        {
          params: { year },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard');
      }
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  },

  /**
   * Export dashboard data
   * @param {object} data - Dashboard data to export
   * @returns {string} CSV formatted data
   */
  exportToCSV(data) {
    const transactions = data.recentTransactions?.data || [];
    const headers = ['Student', 'Invoice', 'Amount', 'Method', 'Status', 'Date'];
    
    const rows = transactions.map(t => [
      t.studentName,
      t.invoiceNo,
      t.amount,
      t.method,
      t.status,
      new Date(t.transactionDate).toLocaleDateString()
    ]);

    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csv;
  }
};
```

Then use it:
```javascript
import { dashboardService } from '../services/dashboardService';

// In your component
const data = await dashboardService.getFinancialDashboard(2024);
```

---

### Example 6: Dashboard with Excel Export

**In `src/components/dashboard/FinancialDashboard.jsx` - Add to header:**
```javascript
const handleExport = async () => {
  try {
    // Convert data to CSV
    const csv = generateCSV(dashboardData);
    
    // Create blob
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-dashboard-${selectedYear}.csv`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
};

const generateCSV = (data) => {
  const headers = ['Student', 'Invoice', 'Amount', 'Method', 'Status', 'Date'];
  const rows = data.recentTransactions?.data.map(t => [
    t.studentName,
    t.invoiceNo,
    t.amount,
    t.method,
    t.status,
    new Date(t.transactionDate).toLocaleDateString('en-IN')
  ]) || [];

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csv;
};

// Add button to header
<button onClick={handleExport} className="btn-outline">
  📥 Export
</button>
```

---

### Example 7: Dashboard with Filter

**Enhanced FinancialDashboard.jsx:**
```javascript
const [filters, setFilters] = useState({
  year: new Date().getFullYear(),
  paymentMethod: null,
  status: null
});

const handleFilterChange = (filterType, value) => {
  setFilters(prev => ({
    ...prev,
    [filterType]: value === 'all' ? null : value
  }));
};

// Filter transactions
const filteredTransactions = dashboardData?.recentTransactions?.data.filter(t => {
  if (filters.paymentMethod && t.method !== filters.paymentMethod) return false;
  if (filters.status && t.status !== filters.status) return false;
  return true;
}) || [];

// Add to JSX
<div className="filter-controls">
  <select 
    value={filters.paymentMethod || 'all'}
    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
  >
    <option value="all">All Methods</option>
    <option value="BANK_TRANSFER">Bank Transfer</option>
    <option value="ONLINE">Online</option>
    <option value="CASH">Cash</option>
  </select>

  <select 
    value={filters.status || 'all'}
    onChange={(e) => handleFilterChange('status', e.target.value)}
  >
    <option value="all">All Status</option>
    <option value="PAID">Paid</option>
    <option value="PENDING">Pending</option>
    <option value="OVERDUE">Overdue</option>
  </select>
</div>

<TransactionsTable
  transactions={filteredTransactions}
  onReceiptClick={handleReceiptClick}
/>
```

---

### Example 8: Dashboard with Print Feature

**Add to FinancialDashboard.jsx header:**
```javascript
const handlePrint = () => {
  window.print();
};

// Add button
<button onClick={handlePrint} className="btn-outline">
  🖨️ Print
</button>

// Add CSS in FinancialDashboard.css
@media print {
  .dashboard-header .dashboard-actions {
    display: none;
  }

  .transactions-table {
    page-break-inside: avoid;
  }

  .chart-inner {
    page-break-inside: avoid;
  }
}
```

---

### Example 9: Dashboard with Cache

**Update FinancialDashboard.jsx:**
```javascript
import { useEffect, useState } from 'react';

const CACHE_KEY = 'dashboard_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getFromCache = (year) => {
  const cached = localStorage.getItem(`${CACHE_KEY}_${year}`);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL) {
    localStorage.removeItem(`${CACHE_KEY}_${year}`);
    return null;
  }

  return data;
};

const saveToCache = (year, data) => {
  localStorage.setItem(
    `${CACHE_KEY}_${year}`,
    JSON.stringify({ data, timestamp: Date.now() })
  );
};

// In useEffect
const fetchDashboardData = async () => {
  // Check cache first
  const cached = getFromCache(selectedYear);
  if (cached) {
    setDashboardData(cached);
    setLoading(false);
    return;
  }

  // Fetch from API
  const response = await axios.get(...);
  saveToCache(selectedYear, response.data.data);
  setDashboardData(response.data.data);
};
```

---

### Example 10: Complete Standalone Dashboard

**One file with everything:**
```javascript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/fee-payments/dashboard?year=${year}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(response.data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  if (loading) return <div className="p-8">Loading...</div>;

  const monthly = data?.monthlyCollection?.data || [];
  const methods = data?.paymentMethodDistribution?.data || [];
  const transactions = data?.recentTransactions?.data || [];
  const summary = data?.summary || {};

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <select 
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        >
          {[2024, 2023, 2022].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Total Collected</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{summary.totalCollected?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Transactions</p>
          <p className="text-2xl font-bold text-blue-600">
            {summary.totalTransactions}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Average</p>
          <p className="text-2xl font-bold text-emerald-600">
            ₹{summary.averageTransactionAmount?.toFixed(0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Monthly Collection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <Bar dataKey="amount" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <XAxis dataKey="monthName" />
              <YAxis />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={methods} dataKey="totalAmount" nameKey="method">
                {methods.map((_, i) => (
                  <Cell key={i} fill={['#22c55e', '#10b981', '#0ea5e9'][i % 3]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-100">
            <tr>
              <th className="px-6 py-3 text-left font-bold">Student</th>
              <th className="px-6 py-3 text-left font-bold">Invoice</th>
              <th className="px-6 py-3 text-left font-bold">Amount</th>
              <th className="px-6 py-3 text-left font-bold">Method</th>
              <th className="px-6 py-3 text-left font-bold">Status</th>
              <th className="px-6 py-3 text-left font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{t.studentName}</td>
                <td className="px-6 py-3">{t.invoiceNo}</td>
                <td className="px-6 py-3">₹{t.amount.toLocaleString()}</td>
                <td className="px-6 py-3">{t.method}</td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded text-white text-sm ${
                    t.status === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button 
                    onClick={() => navigate(`/receipt/${t.id}`)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 🎨 CSS Tips

### Add hover animation to metric cards:
```css
.metric-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

### Make charts mobile responsive:
```css
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-inner {
    height: 250px;
  }
}
```

### Customize table styling:
```css
.transactions-table {
  border-collapse: collapse;
  width: 100%;
}

.transactions-table th {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  padding: 16px;
  text-align: left;
  font-weight: 700;
  border-bottom: 2px solid #22c55e;
}

.transactions-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.transactions-table tr:hover {
  background-color: #f0fdf4;
}
```

---

## ✅ Copy-Paste QA Checklist

Before deploying, copy and paste this into console to test:

```javascript
// Test API connection
fetch(`${import.meta.env.VITE_API_URL}/api/fee-payments/dashboard?year=2024`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => {
  console.log('✅ API Connected');
  console.log('Year:', d.data.year);
  console.log('Monthly Data:', d.data.monthlyCollection.data.length, 'months');
  console.log('Payment Methods:', d.data.paymentMethodDistribution.data.length);
  console.log('Transactions:', d.data.recentTransactions.data.length);
  console.log('Summary:', d.data.summary);
})
.catch(e => console.log('❌ API Error:', e));
```

---

**All examples are ready to copy and paste! 🎉**
