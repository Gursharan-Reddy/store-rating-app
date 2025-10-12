import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    switch (user.role) {
        case 'Admin':
            return <Navigate to="/admin" />;
        case 'Normal':
            return <Navigate to="/dashboard" />;
        case 'StoreOwner':
            return <Navigate to="/store-owner" />;
        default:
            return <Navigate to="/login" />;
    }
};

export default Home;