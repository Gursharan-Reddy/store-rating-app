import React from 'react';

const FilterBar = ({ filters, setFilters, onFilter }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter();
    };

    return (
        <form className="filter-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                value={filters.name || ''}
                onChange={handleInputChange}
                placeholder="Filter by Name..."
            />
            <input
                type="text"
                name="email"
                value={filters.email || ''}
                onChange={handleInputChange}
                placeholder="Filter by Email..."
            />
            <button type="submit">Filter</button>
        </form>
    );
};

export default FilterBar;