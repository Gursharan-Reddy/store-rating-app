import React, { useState, useContext, useEffect } from 'react'; // ✅ CORRECTED THIS LINE
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import PasswordUpdateForm from '../components/PasswordUpdateForm';

const ProfilePage = () => {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleBack = () => {
        switch (user.role) {
            case 'Admin': navigate('/admin'); break;
            case 'Normal': navigate('/dashboard'); break;
            case 'StoreOwner': navigate('/store-owner'); break;
            default: navigate('/'); break;
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await updateProfile(formData);
            setMessage(response.data.message);
            if (response.data.token) {
                login(response.data.token);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <svg
                    onClick={handleBack}
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#007bff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ cursor: 'pointer' }}
                >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <h2>Your Profile</h2>
            </div>

            <form onSubmit={handleProfileUpdate} style={{ marginTop: '2rem' }}>
                <h3>Update Your Details</h3>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                />
                <button type="submit">Update Profile</button>
            </form>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}

            <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

            <PasswordUpdateForm />
        </div>
    );
};

export default ProfilePage;