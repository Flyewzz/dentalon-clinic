import React from 'react';
import ReactModal from 'react-modal';
import EventCalendar from '../Components/EventCalendar';
import './DoctorDashboard.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

ReactModal.setAppElement('#root');

const DoctorDashboard = () => {
    return (
        <div>
            <h1>Личный кабинет врача</h1>
            <EventCalendar baseUrl='http://localhost:5001/api/v1' />
        </div>
    );
};

export default DoctorDashboard;
