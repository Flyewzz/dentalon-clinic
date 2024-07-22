import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './BookingHours.css';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment-timezone';

const timeZone = process.env.REACT_APP_TIME_ZONE || 'UTC';
console.log(`timezone: ${timeZone}`);
moment.locale('ru');

const BookingManagement = ({ apiBaseUrl }) => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const slotsRef = useRef(null);

  const [loader, setLoader] = useState('none');
  const [appointment, setAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/appointments/${appointmentId}`);
        setAppointment(response.data);
        setSelectedDate(new Date(response.data.startTime).toISOString().split('T')[0]); // Установка текущей даты бронирования
      } catch (error) {
        console.error('Error fetching appointment:', error);
      }
    };

    fetchAppointment();
  }, [apiBaseUrl, appointmentId]);

  useEffect(() => {
    if (selectedDate && appointment) {
      const fetchAvailableSlots = async () => {
        try {
          const response = await axios.get(`${apiBaseUrl}/appointments?date=${selectedDate}&type=${appointment.type}`);
          const slots = response.data.filter(
              slot => new Date(slot.startTime) > new Date() && slot.startTime !== appointment.startTime
          );
          setAvailableSlots(slots);
          setSelectedSlotIndex(null); // Сброс выбранного слота

          // Прокрутка к слотам на мобильных устройствах
          if (window.innerWidth <= 600 && slotsRef.current) {
            slotsRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (error) {
          console.error('Error fetching available slots:', error);
        }
      };

      fetchAvailableSlots();
    }
  }, [apiBaseUrl, selectedDate, appointment]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleReschedule = async (event) => {
    event.preventDefault();
    if (selectedSlotIndex === null) {
      toast.error('Выберите доступный слот', { position: 'top-right', autoClose: 8000, pauseOnHover: true, draggable: true, theme: 'dark' });
      return;
    }

    const selectedSlot = availableSlots[selectedSlotIndex];
    setLoader('flex');

    try {
      await axios.put(`${apiBaseUrl}/appointments/${appointmentId}/schedule`, {
        startTime: selectedSlot.startTime,
      });
      toast.success('Запись успешно перенесена', { position: 'top-right', autoClose: 8000, pauseOnHover: true, draggable: true, theme: 'dark' });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Ошибка переноса записи:', error);
      toast.error('Ошибка переноса записи', { position: 'top-right', autoClose: 8000, pauseOnHover: true, draggable: true, theme: 'dark' });
    } finally {
      setLoader('none');
    }
  };

  const handleCancel = async (event) => {
    event.preventDefault();
    try {
      await axios.delete(`${apiBaseUrl}/appointments/${appointmentId}`);
      toast.success('Запись успешно отменена', { position: 'top-right', autoClose: 8000, pauseOnHover: true, draggable: true, theme: 'dark' });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Ошибка отмены записи:', error);
      toast.error('Ошибка отмены записи', { position: 'top-right', autoClose: 8000, pauseOnHover: true, draggable: true, theme: 'dark' });
    }
  };

  const formatTimeSlot = (dateString) => {
    return moment(dateString).tz(timeZone).format('HH:mm');
  };

  if (!appointment) {
    return <div>Loading...</div>;
  }

  return (
      <>
        <div className="booking_section_container">
          <div className="bsc_lower">
            <form method="POST" onSubmit={handleReschedule}>
              <div className="bsc_lower_container">
                <div className="bsc_header">
                  <div className="appointment_hours_form">
                    <div className="form_for_booking">
                      <div className="brand">
                        <h1>Управление бронированием</h1>
                      </div>
                      <div className="in__container">
                        <label>Имя:</label>
                        <p>{appointment.name}</p>
                        <label>Телефон:</label>
                        <p>{appointment.phone}</p>
                        <label>Текущая дата приема:</label>
                        <p>{ moment(appointment.startTime).tz(timeZone).format('DD.MM.YYYY HH:mm').toString()}</p>
                      </div>
                      <div className="in__container">
                        <label>Новая дата приема:</label>
                        <input
                            type="date"
                            name="date"
                            style={{ color: 'white' }}
                            value={selectedDate}
                            min={moment().tz(timeZone).format('YYYY-MM-DD')}
                            max={moment().tz(timeZone).add(1, 'month').format('YYYY-MM-DD')}
                            onChange={handleDateChange}
                            required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="me_slot_selection">
                  <div className="bsc_lower_morning_container" ref={slotsRef}>
                    <div><span>Доступные слоты</span></div>
                    <div className="morning_info_container" id="container45" ref={slotsRef}>
                      {availableSlots.length > 0 ? (
                          availableSlots.map((slot, index) => (
                              <div
                                  key={index}
                                  className="md_data"
                                  style={{
                                    backgroundColor: selectedSlotIndex === index ? 'green' : 'white',
                                    color: selectedSlotIndex === index ? 'white' : 'black',
                                  }}
                                  onClick={() => {
                                    setSelectedSlotIndex(index);
                                  }}
                              >
                                {formatTimeSlot(slot.startTime)}
                              </div>
                          ))
                      ) : (
                          <p className="no-slots">Нет свободных слотов.</p>
                      )}
                    </div>
                  </div>
                  <hr style={{ width: '100%' }} />
                  <div className="submit_slot_btn">
                    <button className="booking_c_btn" id="bcb" type="submit">
                      Перенести прием
                      {/*<Spinner id="sb_loader" style={{ display: loader }} />*/}
                    </button>
                  </div>
                  <div className="cancel_slot_btn">
                    <button className="booking_c_btn cancel_btn" onClick={handleCancel}>
                      Отменить прием
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <ToastContainer />
          </div>
        </div>
      </>
  );
};

export default BookingManagement;
