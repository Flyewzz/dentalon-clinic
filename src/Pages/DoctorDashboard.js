import React from 'react';
import ReactModal from 'react-modal';
import EventCalendar from '../Components/EventCalendar';
import './DoctorDashboard.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ToastContainer } from 'react-toastify';

ReactModal.setAppElement('#root');

const DoctorDashboard = (props) => {
    return (
        <>
            <div>
                <h1>Личный кабинет врача</h1>
                <EventCalendar baseUrl={props.baseUrl} />
            </div>
            <ToastContainer />
        </>
    );
};

export default DoctorDashboard;
