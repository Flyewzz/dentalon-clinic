import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('accessToken');

    if (!isAuthenticated) {
        toast.error("Авторизуйтесь для доступа к этой странице.");
        return <Navigate to="/login_user" replace />;
    }

    return children;
};


export default ProtectedRoute;