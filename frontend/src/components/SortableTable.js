import React from 'react';
import useSortableData from '../hooks/useSortableData';

const SortableTable = ({ data, columns }) => {
    const { items, requestSort, sortConfig } = useSortableData(data);

    const getSortIndicator = (key) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    return (
        <table>
            <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col.key} onClick={() => requestSort(col.key)}>
                            {col.label}{getSortIndicator(col.key)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => (
                    <tr key={item.id || index}>
                        {columns.map((col) => (
                            // ✅ This line adds the crucial data-label attribute
                            <td key={col.key} data-label={col.label}>
                                {col.render ? col.render(item) : item[col.key]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SortableTable;