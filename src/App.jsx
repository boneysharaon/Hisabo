import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Calculator, TrendingUp, FileText, LogOut, Menu, X, IndianRupee, Receipt, PlusCircle } from 'lucide-react';

// Firebase Configuration - REPLACE WITH YOUR CREDENTIALS
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDbKBPzzq8HaC3xAErmdkWr9VTLJSWgH4Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hisabloo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hisabloo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hisabloo.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "196001938451",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:196001938451:web:52cc49d2eea586fa0e13e6"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Demo Credentials: owner@demo.com / 123456

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-blue-600">Loading Hisaabloo...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        setCurrentPage={setCurrentPage} 
        currentPage={currentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {currentPage === 'dashboard' && <Dashboard setCurrentPage={setCurrentPage} />}
        {currentPage === 'pos' && <POSBilling />}
        {currentPage === 'expenses' && <Expenses />}
        {currentPage === 'balance-sheet' && <BalanceSheet />}
      </main>
      <Footer />
    </div>
  );
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Lead capture to Google Sheets (webhook)
        try {
          await fetch('YOUR_GOOGLE_SHEETS_WEBHOOK_URL', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: userCredential.user.email.split('@')[0],
              email: email,
              city: city,
              businessName: businessName,
              timestamp: new Date().toISOString()
            })
          });
        } catch (err) {
          console.log('Lead capture failed:', err);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Hisabo</h1>
          <p className="text-gray-600">Restaurant Accounting Made Simple 🇮🇳</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-gray-600">
          <strong>Demo:</strong> owner@demo.com / 123456
        </div>
      </div>
    </div>
  );
}

function Header({ setCurrentPage, currentPage, mobileMenuOpen, setMobileMenuOpen }) {
  const handleLogout = () => {
    signOut(auth);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'pos', label: 'POS/Billing', icon: Calculator },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'balance-sheet', label: 'Balance Sheet', icon: FileText }
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hisabo 🇮🇳</h1>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    currentPage === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                    currentPage === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

function Dashboard({ setCurrentPage }) {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    gstPayable: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get sales
      const salesQuery = query(
        collection(db, 'bills'),
        where('userId', '==', auth.currentUser.uid),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
      );
      const salesSnapshot = await getDocs(salesQuery);
      let totalSales = 0;
      let totalGST = 0;
      salesSnapshot.forEach(doc => {
        const data = doc.data();
        totalSales += data.grandTotal || 0;
        totalGST += data.gstAmount || 0;
      });

      // Get expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', auth.currentUser.uid),
        where('date', '>=', Timestamp.fromDate(startOfMonth))
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      let totalExpenses = 0;
      expensesSnapshot.forEach(doc => {
        totalExpenses += doc.data().amount || 0;
      });

      setStats({
        totalSales,
        totalExpenses,
        netProfit: totalSales - totalExpenses,
        gstPayable: totalGST
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sales (Month)"
          value={stats.totalSales}
          color="blue"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses (Month)"
          value={stats.totalExpenses}
          color="red"
          icon={Receipt}
        />
        <StatCard
          title="Net Profit"
          value={stats.netProfit}
          color="green"
          icon={IndianRupee}
        />
        <StatCard
          title="GST Payable"
          value={stats.gstPayable}
          color="orange"
          icon={FileText}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setCurrentPage('pos')}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Create New Bill
          </button>
          <button
            onClick={() => setCurrentPage('expenses')}
            className="bg-orange-600 text-white px-6 py-4 rounded-lg hover:bg-orange-700 transition font-semibold"
          >
            Add Expense
          </button>
          <button
            onClick={() => setCurrentPage('balance-sheet')}
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            View Balance Sheet
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon: Icon }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={24} />
      </div>
      <h3 className="text-sm opacity-90 mb-1">{title}</h3>
      <p className="text-2xl font-bold">₹{value.toLocaleString('en-IN')}</p>
    </div>
  );
}

function POSBilling() {
  const [items, setItems] = useState([{ name: '', quantity: 1, rate: 0 }]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, rate: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const grandTotal = subtotal + cgst + sgst;
    return { subtotal, cgst, sgst, grandTotal, gstAmount: cgst + sgst };
  };

  const saveBill = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const totals = calculateTotals();
      await addDoc(collection(db, 'bills'), {
        userId: auth.currentUser.uid,
        items: items,
        ...totals,
        createdAt: Timestamp.now()
      });
      setSuccess(true);
      setItems([{ name: '', quantity: 1, rate: 0 }]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving bill:', err);
      alert('Failed to save bill');
    } finally {
      setSaving(false);
    }
  };

  const printBill = () => {
    const totals = calculateTotals();
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Hisabo</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            .total-row { font-weight: bold; background-color: #f3f4f6; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Hisabo Invoice</h1>
          <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.rate}</td>
                  <td>₹${(item.quantity * item.rate).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">Subtotal</td>
                <td>₹${totals.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3">CGST (9%)</td>
                <td>₹${totals.cgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3">SGST (9%)</td>
                <td>₹${totals.sgst.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Grand Total</td>
                <td>₹${totals.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Made in India 🇮🇳 | Powered by Hisabo
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const totals = calculateTotals();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">POS / Billing</h2>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Bill saved successfully!
          </div>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-12 md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Paneer Butter Masala"
                />
              </div>
              <div className="col-span-5 md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div className="col-span-5 md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div className="col-span-2 md:col-span-2">
                {items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <PlusCircle size={20} />
          Add Item
        </button>

        <div className="mt-6 border-t pt-6">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>CGST (9%):</span>
              <span className="font-semibold">₹{totals.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>SGST (9%):</span>
              <span className="font-semibold">₹{totals.sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Grand Total:</span>
              <span>₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <button
            onClick={saveBill}
            disabled={saving || items.some(item => !item.name)}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Bill'}
          </button>
          <button
            onClick={printBill}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const expensesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesList);
    } catch (err) {
      console.error('Error loading expenses:', err);
    }
  };

  const addExpense = async () => {
    if (!category || !amount) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        userId: auth.currentUser.uid,
        category,
        amount: parseFloat(amount),
        date: Timestamp.fromDate(new Date(date)),
        createdAt: Timestamp.now()
      });
      setCategory('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      loadExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Expenses</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Expense</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="Groceries">Groceries</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Salaries">Salaries</option>
                <option value="Supplies">Supplies</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={addExpense}
              disabled={loading}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No expenses recorded yet</p>
            ) : (
              expenses.map(expense => (
                <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{expense.category}</p>
                      <p className="text-sm text-gray-500">
                        {expense.date?.toDate().toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-red-600">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceSheet() {
  const [data, setData] = useState({
    ownerCapital: 0,
    gstPayable: 0,
    outstandingExpenses: 0,
    cashInHand: 0,
    netProfit: 0,
    bankBalance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalanceSheetData();
  }, []);

  const loadBalanceSheetData = async () => {
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Get all bills
      const billsQuery = query(
        collection(db, 'bills'),
        where('userId', '==', auth.currentUser.uid),
        where('createdAt', '>=', Timestamp.fromDate(startOfYear))
      );
      const billsSnapshot = await getDocs(billsQuery);
      let totalSales = 0;
      let totalGST = 0;
      billsSnapshot.forEach(doc => {
        const data = doc.data();
        totalSales += data.grandTotal || 0;
        totalGST += data.gstAmount || 0;
      });

      // Get all expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', auth.currentUser.uid),
        where('date', '>=', Timestamp.fromDate(startOfYear))
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      let totalExpenses = 0;
      expensesSnapshot.forEach(doc => {
        totalExpenses += doc.data().amount || 0;
      });

      const netProfit = totalSales - totalExpenses;
      
      setData({
        ownerCapital: 100000,
        gstPayable: totalGST,
        outstandingExpenses: 0,
        cashInHand: totalSales * 0.3,
        netProfit: netProfit,
        bankBalance: totalSales * 0.7
      });
    } catch (err) {
      console.error('Error loading balance sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const totalLiabilities = data.ownerCapital + data.gstPayable + data.outstandingExpenses;
    const totalAssets = data.cashInHand + data.netProfit + data.bankBalance;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Balance Sheet - Hisaabloo</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            .total { font-weight: bold; background-color: #f3f4f6; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Balance Sheet - Hisaabloo</h1>
          <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
          <table>
            <thead>
              <tr>
                <th>Liabilities</th>
                <th>Amount (₹)</th>
                <th>Assets</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Owner's Capital</td>
                <td>₹${data.ownerCapital.toLocaleString('en-IN')}</td>
                <td>Cash in Hand</td>
                <td>₹${data.cashInHand.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>GST Payable</td>
                <td>₹${data.gstPayable.toLocaleString('en-IN')}</td>
                <td>Net Profit</td>
                <td>₹${data.netProfit.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>Outstanding Expenses</td>
                <td>₹${data.outstandingExpenses.toLocaleString('en-IN')}</td>
                <td>Bank Balance</td>
                <td>₹${data.bankBalance.toLocaleString('en-IN')}</td>
              </tr>
              <tr class="total">
                <td>Total Liabilities</td>
                <td>₹${totalLiabilities.toLocaleString('en-IN')}</td>
                <td>Total Assets</td>
                <td>₹${totalAssets.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Made in India 🇮🇳 | Powered by Hisaabloo
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return <div className="text-center py-12">Loading balance sheet...</div>;
  }

  const totalLiabilities = data.ownerCapital + data.gstPayable + data.outstandingExpenses;
  const totalAssets = data.cashInHand + data.netProfit + data.bankBalance;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Balance Sheet</h2>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-orange-500 text-white">
                <th className="px-4 py-3 text-left">Liabilities</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
                <th className="px-4 py-3 text-left">Assets</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3">Owner's Capital</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{data.ownerCapital.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">Cash in Hand</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{data.cashInHand.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3">GST Payable</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{data.gstPayable.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">Net Profit</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{data.netProfit.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3">Outstanding Expenses</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{data.outstandingExpenses.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">Bank Balance</td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{data.bankBalance.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="bg-blue-50 font-bold">
                <td className="px-4 py-3">Total Liabilities</td>
                <td className="px-4 py-3 text-right">
                  ₹{totalLiabilities.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">Total Assets</td>
                <td className="px-4 py-3 text-right">
                  ₹{totalAssets.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <button
            onClick={exportPDF}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Export PDF
          </button>
          <button
            className="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed font-semibold"
            disabled
          >
            GST Filing - Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">Made in India 🇮🇳 | Powered by Hisaabloo</p>
        <p className="text-xs text-gray-400 mt-2">
          Free Restaurant Accounting for Indian Businesses
        </p>
      </div>
    </footer>
  );
}

export default App;