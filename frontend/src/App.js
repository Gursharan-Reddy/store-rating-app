// A small change to trigger a fresh Vercel deployment.
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ProfilePage from './pages/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserDashboard from './pages/User/UserDashboard';
import StoreOwnerDashboard from './pages/StoreOwner/StoreOwnerDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <main className="container">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* Protected Routes that require a specific role */}
                        <Route 
                            path="/admin" 
                            element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/dashboard" 
                            element={<ProtectedRoute roles={['Normal']}><UserDashboard /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/store-owner" 
                            element={<ProtectedRoute roles={['StoreOwner']}><StoreOwnerDashboard /></ProtectedRoute>} 
                        />
                        
                        {/* A generic protected route for any logged-in user */}
                        <Route 
                            path="/profile" 
                            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
                        />

                        {/* The home route, which redirects based on user role */}
                        <Route path="/" element={<Home />} />
                        
                        {/* A fallback route for any other path */}
                        <Route path="*" element={<Home />} />
                    </Routes>
                </main>
            </Router>
        </AuthProvider>
    );
}

export default App;