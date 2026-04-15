import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { transactionsData } from "../data/transactionsData";

/* 👇 IMPORT YOUR OLD GRAPH COMPONENTS */
import MonthlyFeeChart from "../components/charts/MonthlyFeeChart";
import PaymentMethodChart from "../components/charts/PaymentMethodChart";
import { getDashboardMetrics, getMonthlyData, getPaymentMethodData, getRecentTransactionsData } from "../data/dashboardData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalRefund: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Fetch all dashboard data from database on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [metricsData, monthlyChartData, paymentData, transactionsData] = await Promise.all([
          getDashboardMetrics(),
          getMonthlyData(),
          getPaymentMethodData(),
          getRecentTransactionsData(10)
        ]);

        setMetrics(metricsData);
        setMonthlyData(monthlyChartData);
        setPaymentMethodData(paymentData);
        setRecentTransactions(transactionsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Keep showing UI with empty data rather than breaking
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleView = (transaction) => {
    if (transaction.status === "Paid" || transaction.status === "completed") {
      navigate(`/receipt/${transaction.invoiceId || transaction.id}`);
    } else {
      navigate(`/payment/${transaction.invoiceId || transaction.id}`);
    }
  };

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Fees & Payments Dashboard</h1>
          <p>Fee management overview, collection trends, and pending action items</p>
        </div>

        <div className="dashboard-actions">
          <button onClick={() => navigate("/bulk-upload")} className="btn-outline">
            Bulk Upload
          </button>

          <button onClick={() => navigate("/refund-management")} className="btn-outline">
            Refund Management
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="cards-grid">
        <div className="card blue">
          <h4>Total Fees Collected</h4>
          <h2>₹{(metrics.totalCollected / 100000).toFixed(2)}L</h2>
        </div>

        <div className="card yellow">
          <h4>Pending Payments</h4>
          <h2>₹{(metrics.totalPending / 100000).toFixed(2)}L</h2>
        </div>

        <div className="card red">
          <h4>Overdue Payments</h4>
          <h2>₹{(metrics.totalOverdue / 100000).toFixed(2)}L</h2>
        </div>

        <div className="card green">
          <h4>Refund Requests</h4>
          <h2>₹{(metrics.totalRefund / 100000).toFixed(2)}L</h2>
        </div>
      </div>

      {/* ✅ GRAPHS SECTION (ADDED BACK) */}
      <div className="charts-grid">
        <div className="chart-card">
        
          <MonthlyFeeChart data={monthlyData} />
        </div>

        <div className="chart-card">
          
          <PaymentMethodChart data={paymentMethodData} />
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="transactions-section">
        <div className="transactions-header">
          <h3>Recent Transactions</h3>

          <button onClick={() => navigate("/fees")} className="view-all-btn">
            View All
          </button>
        </div>

        <table className="transactions-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Invoice</th>
              <th>Class</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  Loading transactions...
                </td>
              </tr>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((item) => (
                <tr key={item.id}>
                  <td>{item.studentName}</td>
                  <td className="invoice">{item.studentId}</td>
                  <td>-</td>
                  <td>₹{item.amountPaid?.toLocaleString() || 0}</td>
                  <td>Fee Payment</td>

                  <td>
                    <span className={`status ${(item.paymentStatus || '').toLowerCase()}`}>
                      {item.paymentStatus || 'PENDING'}
                    </span>
                  </td>

                  <td>{item.createdAt || new Date().toLocaleDateString()}</td>

                  <td>
                    <button
                      onClick={() => handleView(item)}
                      className="action-btn"
                    >
                      {item.paymentStatus === "PAID" ? "View Receipt" : "Make Payment"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;
