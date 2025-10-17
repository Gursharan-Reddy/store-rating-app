import React, { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getUsers, getStores, createUser } from '../../services/adminService';
import StatCard from '../../components/StatCard';
import SortableTable from '../../components/SortableTable';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: '...', totalStores: '...', totalRatings: '...' });
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [message, setMessage] = useState('');

    const initialNewUserState = {
        name: '', email: '', password: '', address: '', role: 'Normal',
        storeName: '', storeEmail: '', storeAddress: ''
    };
    const [newUser, setNewUser] = useState(initialNewUserState);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, usersRes, storesRes] = await Promise.all([
                getDashboardStats(), getUsers(), getStores()
            ]);
            setStats({
                totalUsers: statsRes.data.totalUsers,
                totalStores: statsRes.data.totalStores,
                totalRatings: statsRes.data.totalRatings,
            });
            setUsers(usersRes.data);
            setStores(storesRes.data);
        } catch (error) { 
            console.error("Failed to fetch admin data", error);
            setStats({ totalUsers: 'Error', totalStores: 'Error', totalRatings: 'Error' });
        }
    }, []);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await createUser(newUser);
            setMessage(`Creation successful!`);
            setNewUser(initialNewUserState);
            fetchData(); 
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to create user.');
        }
    };

    const userColumns = [
        { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
        { key: 'address', label: 'Address' }, { key: 'role', label: 'Role' },
    ];
    
    const storeColumns = [
        { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
        { key: 'address', label: 'Address' }, 
        { key: 'rating', label: 'Avg. Rating', render: item => parseFloat(item.rating).toFixed(2) },
    ];

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <div className="dashboard-stats">
                <StatCard title="Total Users" value={stats.totalUsers} />
                <StatCard title="Total Stores" value={stats.totalStores} />
                <StatCard title="Total Ratings" value={stats.totalRatings} />
            </div>

            <form onSubmit={handleUserSubmit} style={{ marginTop: '3rem' }}>
                <h3>Create New User</h3>
                <input type="text" name="name" value={newUser.name} onChange={handleUserChange} placeholder="Full Name (min 20 chars)" required />
                <input type="email" name="email" value={newUser.email} onChange={handleUserChange} placeholder="User Email" required />
                <input type="password" name="password" value={newUser.password} onChange={handleUserChange} placeholder="Password" required />
                <textarea name="address" value={newUser.address} onChange={handleUserChange} placeholder="User Address" required />
                <select name="role" value={newUser.role} onChange={handleUserChange}>
                    <option value="Normal">Normal User</option>
                    <option value="StoreOwner">Store Owner</option>
                    <option value="Admin">Admin</option>
                </select>

                {newUser.role === 'StoreOwner' && (
                    <>
                        <h4 style={{ marginTop: '1.5rem', marginBottom: '0', color: '#555' }}>Store Details (Required for Owner)</h4>
                        <input 
                            type="text" 
                            name="storeName" 
                            value={newUser.storeName} 
                            onChange={handleUserChange} 
                            placeholder="Store Name" 
                            required 
                        />
                        <input 
                            type="email" 
                            name="storeEmail" 
                            value={newUser.storeEmail} 
                            onChange={handleUserChange} 
                            placeholder="Store Contact Email" 
                            required 
                        />
                         <textarea 
                            name="storeAddress" 
                            value={newUser.storeAddress} 
                            onChange={handleUserChange} 
                            placeholder="Store Address" 
                            required 
                        />
                    </>
                )}

                <button type="submit">Create User</button>
                {message && <p className={message.includes('successful') ? 'success' : 'error'}>{message}</p>}
            </form>

            <h3>All Users</h3>
            <SortableTable data={users} columns={userColumns} />

            <h3>All Stores</h3>
            <SortableTable data={stores} columns={storeColumns} />
        </div>
    );
};

export default AdminDashboard;