import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import BulkUpload from './pages/BulkUpload'
import ExportReport from './pages/ExportReport'
import Fees from './pages/Fees'
import Invoice from './pages/Invoice'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import Receipt from './pages/Receipt'
import RefundManagement from './pages/RefundManagement'
import RefundRequest from './pages/RefundRequest'
import RefundDetails from './pages/RefundDetails'
import RefundRequestSuccess from './pages/RefundRequestSuccess'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        {/* Bulk Upload */}
        <Route
          path="/bulk-upload"
          element={
            <MainLayout>
              <BulkUpload />
            </MainLayout>
          }
        />

        {/* Export Report */}
        <Route
          path="/export-report"
          element={
            <MainLayout>
              <ExportReport />
            </MainLayout>
          }
        />

        {/* All Transactions / Fees */}
        <Route
          path="/fees"
          element={
            <MainLayout>
              <Fees />
            </MainLayout>
          }
        />

        {/* Invoice Details */}
        <Route
          path="/invoice/:invoiceId"
          element={
            <MainLayout>
              <Invoice />
            </MainLayout>
          }
        />

        {/* Payment Page */}
        <Route
          path="/payment/:invoiceId"
          element={
            <MainLayout>
              <Payment />
            </MainLayout>
          }
        />

        {/* Payment Success */}
        <Route
          path="/payment-success"
          element={
            <MainLayout>
              <PaymentSuccess />
            </MainLayout>
          }
        />
        {/* Receipt Page - For Paid Invoices */}
        <Route
          path="/receipt/:invoiceId"
          element={
            <MainLayout>
              <Receipt />
            </MainLayout>
          }
        />

       

      

        {/* Refund Success */}
        <Route
          path="/refund/success"
          element={
            <MainLayout>
              <RefundRequestSuccess />
            </MainLayout>
          }
        />
     

        {/* Refund Management */}
        <Route
          path="/refund-management"
          element={
            <MainLayout>
              <RefundManagement />
            </MainLayout>
          }
        />

        {/* Refund Request Form */}
        <Route
          path="/refund-request"
          element={
            <MainLayout>
              <RefundRequest />
            </MainLayout>
          }
        />

        {/* Refund Details */}
        <Route
          path="/refund-details/:id"
          element={
            <MainLayout>
              <RefundDetails />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
