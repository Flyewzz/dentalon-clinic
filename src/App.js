import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Pages/Navbar';
import Home from './Pages/Home';
import About from './Pages/About';
import Appointment from './Pages/Appointment';
import Services from './Pages/Services';
import Contact from './Pages/Contact';
import Login from './Pages/Login';
import Register from './Pages/Register';
import BookingHours from './Pages/BookingHours';
import Profile from './Pages/Profile';
import UserProfile from './Pages/UserProfile';
import ApBooking from './Components/ApBooking';
import Dashboard from './Pages/PagesData/Admin/Dashboard';
import DoctorDashboard from "./Pages/DoctorDashboard";
import ProtectedRoute from "./Utils/ProtectedRoute";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          exact
          path="/"
          element={
            <>
              <Home />
              <ApBooking />
              <About />
              <Services />
              <Contact />
            </>
          }
        />
        <Route
          exact
          path="/dental-clinic/appointment"
          element={<Appointment />}
        />
        <Route exact path="/dental-clinic/treatments"/> 
        <Route exact path="/dental-clinic/contact"/> 
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/dental-clinic/team" element={<Profile />} />
        <Route exact path="/login_user" element={<Login baseUrl={process.env.REACT_APP_SERVER_BASE_URL} />} />
        <Route
          exact
          path="/dental-clinic/user/profile"
          element={<UserProfile />}
        />
        <Route exact path="/dental-clinic/slot" element={<BookingHours apiBaseUrl={process.env.REACT_APP_SERVER_BASE_URL} />} />
        <Route
          exact
          path="/dental-clinic/admin-person"
          element={<Dashboard />}
        />
        <Route exact path="/dental-clinic/doctor-dashboard" element={
          <ProtectedRoute><DoctorDashboard baseUrl={process.env.REACT_APP_SERVER_BASE_URL} /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

export default App;
