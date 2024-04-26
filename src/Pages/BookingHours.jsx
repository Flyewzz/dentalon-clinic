import React, {useEffect, useState} from 'react';
import EveningData from './PagesData/EveningData';
import MorningData from './PagesData/MorningData';
import Logo from '../assets/logo.png';
import { ToastContainer, toast } from 'react-toastify';
import './BookingHours.css';
import { useNavigate } from 'react-router-dom';
import Spinner from '../Components/Spinner';
import axios from "axios";

const BookingHours = () => {
  const url = 'http://localhost:5001/api/v1/appointments';
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  
  const [loader, setLoader] = useState('none');
  const [activeUser, setActiveUser] = useState({
    date: '',
    name: '',
    email: '',
    phone: '',
    startTime: '',
    endTime: '',
  });
  const [btn, setBtn] = useState(0);
  const [aces, setACES] = useState(-1);
  const [ace, setACE] = useState(-1);
  const [slots, setSlots] = useState([]);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  function formatTimeSlot(dateString) {
    const date = new Date(dateString);

    // Форматирование начального времени с учётом часового пояса
    const startTime = date.toLocaleTimeString('ru-RU', {
      // timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Вычисление и форматирование конечного времени слота (плюс один час)
    date.setHours(date.getHours() + 1);
    const endTime = date.toLocaleTimeString('ru-RU', {
      // timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${startTime}-${endTime}`;
  }

  useEffect(() => {
    if (date) {
      // Предполагается использование axios для отправки запросов на API
      fetch(`http://localhost:5001/api/v1/appointments/${date}`)
          .then(response => response.json())
          .then(data => {
            setSlots(data); // предполагаем, что сервер возвращает { availableSlots: [...] }
            setSelectedSlotIndex(null); // Сброс выбора при смене даты
          })
          .catch(error => console.error('Error fetching slots:', error));
    }
  }, [date]);
  
  const toastOptions = {
    position: 'top-right',
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  };

  let name, value;
  const handleInputs = (e) => {
    name = e.target.name;
    value = e.target.value;
    setActiveUser({ ...activeUser, [name]: value });
  };

  function checkDate(selectedDate) {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    console.log(formattedDate);
    if (selectedDate < formattedDate) {
      alert('Date must be in the future');
      return false;
    }

    return true;
  }

  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0'); // Месяцы начинаются с 0
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };
  
  const handleValidation = () => {
    const { date, name, email, phone, time } = activeUser;
    if (date === '') {
      toast.error('Choose the Date', toastOptions);
      return false;
    } else if (name === '') {
      toast.error('Enter your name', toastOptions);
      return false;
    } else if (email === '') {
      toast.error('Enter your Email', toastOptions);
      return false;
    } else if (phone === '') {
      toast.error('Enter Your Currect Phone No', toastOptions);
      return false;
    } else if (time === '') {
      toast.error('Choose your slot timing', toastOptions);
      return false;
    } else if (
      date === '' ||
      name === '' ||
      email === '' ||
      phone === '' ||
      time === ''
    ) {
      toast.error('Plz Enter Your all details', toastOptions);
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    const { date, name, email, phone, startTime, endTime } = activeUser;
    const requestOptions = {
      date,
      name,
      email,
      phone,
      startTime,
      endTime,
    };

    console.log(requestOptions);

    if (handleValidation()) {
      setBtn(1);
      setLoader('flex');

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestOptions),
        });

        if (res.status === 201) {
          console.log('Your data submitted to the server.');
          toast.success('Successfully made an appointment', toastOptions);

          const form = event.target;
          form.reset();

          setTimeout(() => {
            navigate('/');
          }, 4000);
        } else if (res.status === 401) {
          const data = await res.json();
          toast.error(data.message, toastOptions);
        } else {
          console.error('An error occurred while processing your request.');
          toast.error(
            'An error occurred while processing your request.',
            toastOptions
          );
        }
      } catch (err) {
        console.error(err);
        toast.error(
          'An error occurred while processing your request.',
          toastOptions
        );
      } finally {
        setBtn(0);
        setLoader('none');
      }
    }
  };

  return (
    <>
      <div className="booking_section_container">
        <div className="bsc_lower">
          <form method="POST" onSubmit={handleSubmit}>
            <div className="bsc_lower_container">
              <div className="bsc_header">
                <div className="appointment_hours_form">
                  <div className="form_for_booking">
                    <div className="brand">
                      <img src={Logo} alt="logo" />
                      <h1>Денталон</h1>
                    </div>
                    <div className="in__container">
                      <label>Выберите дату записи</label>
                      <input
                        type="date"
                        name="date"
                        style={{ color: 'White' }}
                        value={date}
                        defaultValue= { getCurrentDate() }
                        min={ getCurrentDate() }
                        onChange={(event) => {
                          const selectedDate = event.target.value;
                          console.log(selectedDate);
                          if (checkDate(selectedDate)) {
                            handleInputs(event);
                          }
                          
                          handleDateChange(event);
                        }}
                        required
                      />
                    </div>
                    <div className="in__container">
                      <label>ФИО</label>
                      <input
                        type="text"
                        placeholder="Введите ФИО"
                        name="name"
                        min="3"
                        value={activeUser.name}
                        onChange={handleInputs}
                        required
                      />
                    </div>
                    <div className="in__container">
                      <label>Email</label>
                      <input
                        type="email"
                        placeholder="Введите ваш email"
                        name="email"
                        min="3"
                        value={activeUser.email}
                        onChange={handleInputs}
                        required
                      />
                    </div>
                    <div className="in__container">
                      <label>Номер телефона </label>
                      <input
                        type="number"
                        placeholder="Введите ваш номер телефона"
                        name="phone"
                        value={activeUser.phone}
                        onChange={handleInputs}
                        onKeyPress={(event) => {
                          if (event.target.value.length >= 10) {
                            event.preventDefault();
                          }
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="me_slot_selection">
                <div className="bsc_lower_morning_container">
                  <span>Morning and Evening Slots</span>
                  <div className="morning_info_container" id="container45">
                    {slots !== undefined && slots.length > 0 ? (
                        slots.map((slot, index) => (
                            <div
                                key={index}
                                className="md_data"
                                style={{
                                  backgroundColor: selectedSlotIndex === index ? 'green' : 'white',
                                  color: selectedSlotIndex === index ? 'white' : 'black',
                                }}
                                onClick={() => {
                                  setSelectedSlotIndex(index);
                                  setActiveUser({
                                    ...activeUser,
                                    startTime: slot.startTime,
                                    endTime: slot.endTime,
                                  });
                                }}
                            >
                              {formatTimeSlot(slot.startTime)}
                            </div>
                        ))
                    ) : (
                        
                        <p className="no-slots">No available slots.</p>
                    )}
                  </div>
                </div>
                <hr/>
                <div className="submit_slot_btn">
                  <button className="booking_c_btn" id="bcb" type="submit">
                        <span style={btn === 1 ? {display: 'none'} : {}}>
                          Submit
                        </span>
                    <Spinner id="sb_loader" style={loader}/>
                  </button>
                </div>
              </div>
            </div>
          </form>
          <ToastContainer/>
        </div>
      </div>
    </>
  );
};

export default BookingHours;
