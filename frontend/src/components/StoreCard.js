import React from 'react';

// This component is designed specifically for a clean mobile layout.
const StoreCard = ({ store, onRate }) => {
    return (
        <div className="store-card">
            <div className="store-card-row">
                <strong>Store Name:</strong>
                <span>{store.name}</span>
            </div>
            <div className="store-card-row">
                <strong>Address:</strong>
                <span>{store.address}</span>
            </div>
            <div className="store-card-row">
                <strong>Overall Rating:</strong>
                <span>{store.overallRating.toFixed(2)}</span>
            </div>
            <div className="store-card-row">
                <strong>Your Rating:</strong>
                <span>{store.userSubmittedRating || 'N/A'}</span>
            </div>
            <div className="store-card-rating-section">
                <strong>Rate Store:</strong>
                <div className="rating-buttons-container">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => onRate(store.id, star)}
                            style={{ background: store.userSubmittedRating === star ? '#28a745' : '' }}
                        >
                            {star} ★
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StoreCard;