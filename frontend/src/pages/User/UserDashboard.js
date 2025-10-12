import React, { useState, useEffect, useCallback } from 'react';
import { getStoresForUser, submitRating } from '../../services/userService';
import SortableTable from '../../components/SortableTable';
import StoreCard from '../../components/StoreCard';
import useMediaQuery from '../../hooks/useMediaQuery';

const UserDashboard = () => {
    const [stores, setStores] = useState([]);
    const [filters, setFilters] = useState({ name: '', address: '' });
    const isMobile = useMediaQuery(768);

    const fetchStores = useCallback(async () => {
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value.trim() !== '')
            );
            const res = await getStoresForUser(activeFilters);
            setStores(res.data);
        } catch (error) { 
            console.error("Failed to fetch stores. Check the Network tab in your browser's dev tools for a backend error.", error);
        }
    }, [filters]);

    useEffect(() => { 
        fetchStores(); 
    }, [fetchStores]);

    const handleRating = async (storeId, rating) => {
        try {
            await submitRating({ storeId, rating });
            fetchStores();
        } catch (error) { 
            console.error("Failed to submit rating.", error);
        }
    };

    const handleFilterChange = (e) => { setFilters({ ...filters, [e.target.name]: e.target.value }); };
    const handleFilterSubmit = (e) => { e.preventDefault(); fetchStores(); };

    const columns = [
        { key: 'name', label: 'Store Name' },
        { key: 'address', label: 'Address' },
        { 
            key: 'overallRating', 
            label: 'Overall Rating', 
            render: item => parseFloat(item.overallRating).toFixed(2) 
        },
        { 
            key: 'userSubmittedRating', 
            label: 'Your Rating', 
            render: item => item.userSubmittedRating || 'N/A' 
        },
        {
            key: 'actions',
            label: 'Rate Store',
            render: (store) => (
                <div className="rating-buttons-container">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleRating(store.id, star)}
                            style={{ background: store.userSubmittedRating === star ? '#28a745' : '' }}>
                            {star} ★
                        </button>
                    ))}
                </div>
            )
        },
    ];

    return (
        <div>
            <h2>Find and Rate Stores</h2>
            <form onSubmit={handleFilterSubmit} className="filter-bar">
                 <input type="text" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by Name..." />
                 <input type="text" name="address" value={filters.address} onChange={handleFilterChange} placeholder="Filter by Address..." />
                 <button type="submit">Filter</button>
            </form>

            <div style={{ marginTop: '2rem' }}>
                {isMobile ? (
                    <div className="store-card-list">
                        {stores.map(store => (
                            <StoreCard key={store.id} store={store} onRate={handleRating} />
                        ))}
                    </div>
                ) : (
                    <SortableTable data={stores} columns={columns} />
                )}
            </div>
        </div>
    );
};

export default UserDashboard;