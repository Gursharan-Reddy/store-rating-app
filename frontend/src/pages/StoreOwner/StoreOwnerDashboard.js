import React, { useState, useEffect, useCallback } from 'react';
import { getStoreOwnerDashboard } from '../../services/storeOwnerService';
import StatCard from '../../components/StatCard';
import SortableTable from '../../components/SortableTable';

const StoreOwnerDashboard = () => {
    const [data, setData] = useState({ averageRating: 0, raters: [] });

    const fetchData = useCallback(async () => {
        try {
            const res = await getStoreOwnerDashboard();
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch dashboard", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns = [
        { key: 'name', label: 'User Name' },
        { key: 'email', label: 'User Email' },
        { key: 'rating', label: 'Rating Given' },
    ];

    return (
        <div>
            <h2>Your Store Dashboard</h2>
            <div className="dashboard-stats">
                <StatCard title="Average Rating" value={parseFloat(data.averageRating).toFixed(2) ?? '...'} />
            </div>
            <h3>Users Who Rated Your Store</h3>
            <SortableTable data={data.raters} columns={columns} />
        </div>
    );
};

export default StoreOwnerDashboard;