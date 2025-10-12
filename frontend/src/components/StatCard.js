import React from 'react';

const cardStyle = {
    background: '#eef4ff',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #dbe8ff',
};

const StatCard = ({ title, value }) => (
    <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: '#333' }}>{title}</h3>
        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#007bff', margin: 0 }}>
            {value}
        </p>
    </div>
);

export default StatCard;