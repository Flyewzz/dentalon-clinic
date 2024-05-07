import React, {useEffect, useState} from 'react';
import Logo from '../assets/logo.png';
import {toast, ToastContainer} from 'react-toastify';
import './BookingHours.css';
import {useNavigate} from 'react-router-dom';
import Spinner from '../Components/Spinner';

const BookingHours = (props) => {
  const apiBaseUrl = props.apiBaseUrl;
  const url = `${apiBaseUrl}/appointments`;
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  
  const [loader, setLoader] = useState('none');
  const [activeUser, setActiveUser] = useState({
    date: '',
    name: '',
    email: '',
    phone: '',
    startTime: '',
  });
  const [btn, setBtn] = useState(0);
  const [slots, setSlots] = useState([]);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [selectedType, setSelectedType] = useState('consultation'); // По умолчанию устанавливаем консультацию

  function formatTimeSlot(dateString) {
    const date = new Date(dateString);

    // Форматирование начального времени с учётом часового пояса
    return date.toLocaleTimeString('ru-RU', {
      // timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  useEffect(() => {
    async function fetchSlots() {
      if (!date) return;

      try {
        const response = await fetch(`${apiBaseUrl}/appointments?date=${date}&type=${selectedType}`);
        const data = await response.json();
        
        setSlots(data); // Обновление слотов
        setSelectedSlotIndex(null); // Сброс выбранного слота
      } catch (error) {
        console.error('Error fetching slots:', error);
      }
    }

    fetchSlots();
  }, [selectedType, date, apiBaseUrl]);
  
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

    const { date, name, email, phone, startTime } = activeUser;
    const requestOptions = {
      date,
      name,
      email,
      phone,
      startTime,
      type: selectedType, 
    };

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
          }, 2000);
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
                      <label htmlFor="type">Тип слота:</label>
                      <select id="type" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                        <option value="consultation">Консультация</option>
                        <option value="treatment">Лечение</option>
                      </select>
                    </div>
                    <div className="in__container">
                      <label>Выберите дату записи</label>
                      <input
                          type="date"
                          name="date"
                          style={{color: 'White' }}
                        value={date}
                        defaultValue= { getCurrentDate() }
                        min={ getCurrentDate() }
                        onChange={(event) => {
                          const selectedDate = event.target.value;
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
                        type="tel"
                        placeholder="Введите ваш номер телефона"
                        name="phone"
                        value={activeUser.phone}
                        onChange={handleInputs}
                        onKeyPress={(event) => {
                          if (event.target.value.length >= 15) {
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
                  <div><span>Свободные слоты</span></div>
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
                                  });
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
                <hr/>
                <div className="submit_slot_btn">
                  <button className="booking_c_btn" id="bcb" type="submit">
                        <span style={btn === 1 ? {display: 'none'} : {}}>
                          Записаться
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
