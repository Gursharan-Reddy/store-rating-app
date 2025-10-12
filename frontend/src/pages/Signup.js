import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup as signupService } from '../services/authService';

const SignupPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await signupService(formData);
            setSuccess('Signup successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed.');
        }
    };

    // This is the form the user will see
    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name (min 20 chars)" required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address (max 400 chars)" required />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password (8-16 chars, 1 upper, 1 special)" required />
                <button type="submit">Sign Up</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default SignupPage;