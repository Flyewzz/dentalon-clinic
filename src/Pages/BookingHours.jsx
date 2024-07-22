import React, {useEffect, useRef, useState} from 'react';
import Logo from '../assets/logo.png';
import {toast, ToastContainer} from 'react-toastify';
import './BookingHours.css';
import {useNavigate} from 'react-router-dom';
import Spinner from '../Components/Spinner';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import moment from "moment-timezone";

const timeZone = process.env.REACT_APP_TIME_ZONE || 'UTC';
console.log(`timezone: ${timeZone}`);

const BookingHours = (props) => {
  const apiBaseUrl = props.apiBaseUrl;
  const url = `${apiBaseUrl}/appointments`;
  const navigate = useNavigate();
  const slotsRef = useRef(null);

  const [loader, setLoader] = useState('none');
  const [activeUser, setActiveUser] = useState({
    date: moment().tz(timeZone).format('YYYY-MM-DD'),
    name: '',
    address: 'г. Петропавловск-Камчатский, ул. Улица дом, кв',
    phone: '',
    startTime: '',
  });
  const [btn, setBtn] = useState(0);
  const [slots, setSlots] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [selectedType, setSelectedType] = useState('consultation'); // По умолчанию устанавливаем консультацию

  const formatTimeSlot = (dateString) => {
    return moment(dateString).tz(timeZone).format('HH:mm');
  };

  useEffect(() => {
    async function fetchSlots() {
      if (!activeUser.date) return;

      try {
        const response = await fetch(`${apiBaseUrl}/appointments?date=${activeUser.date}&type=${selectedType}`);
        const data = await response.json();

        setSlots(data); // Обновление слотов
        setSelectedSlotIndex(null); // Сброс выбранного слота

        // Прокрутка к слотам на мобильных устройствах
        if (window.innerWidth <= 600 && slotsRef.current) {
          slotsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
      }
    }

    fetchSlots();
  }, [selectedType, activeUser.date, apiBaseUrl]);

  useEffect(() => {
    async function fetchQuestions() {
      if (selectedType === 'consultation') {
        try {
          // Получение вопросов врача (ID врача пока статически равен 1)
          const response = await fetch(`${apiBaseUrl}/appointments/doctor/1/questions`);
          const data = await response.json();
          setQuestions(data);
        } catch (error) {
          console.error('Ошибка при получении вопросов:', error);
        }
      } else {
        setQuestions([]);
      }
    }

    fetchQuestions();
  }, [selectedType, apiBaseUrl]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer
    });
  };

  const toastOptions = {
    position: 'top-right',
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  };

  let name, value;
  const handleInputs = (e) => {
    if (!e) {
      return;
    }

    if (e.target) { // Обработка обычных инпутов
      name = e.target.name;
      value = e.target.value;
    } else { // e — это строка, пришедшая от PhoneInput
      name = 'phone';
      value = e;
    }
    setActiveUser({ ...activeUser, [name]: value });
  };

  function checkDate(selectedDate) {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    console.log(formattedDate);
    if (selectedDate < formattedDate) {
      alert('Дата должна быть в будущем');
      return false;
    }

    return true;
  }

  const handleValidation = () => {
    const { date, name, address, phone, time } = activeUser;
    if (date === '') {
      toast.error('Выберите дату записи', toastOptions);
      return false;
    } else if (selectedType === '') {
      toast.error('Выберите тип записи (консультация / лечение)', toastOptions);
      return false;
    } else if (name === '') {
      toast.error('Введите ваши ФИО', toastOptions);
      return false;
    } else if (address === '') {
      toast.error('Введите корректный адрес', toastOptions);
      return false;
    } else if (phone === '') {
      toast.error('Введите корректный номер телефона', toastOptions);
      return false;
    } else if (time === '') {
      toast.error('Выберите доступный слот', toastOptions);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { date, name, address, phone, startTime } = activeUser;
    const requestOptions = {
      date,
      name,
      address,
      phone,
      startTime,
      type: selectedType,
      questions: questions.map((question, index) => ({
        question: question.question,
        answer: answers[index]
      }))
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
          toast.success('Вы успешно записались на прием', toastOptions);

          const form = event.target;
          form.reset();

          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else if (res.status === 401) {
          const data = await res.json();
          toast.error(data.message, toastOptions);
        } else {
          console.error('Возникла ошибка при обработке вашего запроса');
          const data = await res.json();
          toast.error(data.message, toastOptions);
        }
      } catch (err) {
        console.error(err);
        toast.error(
            err.message,
            toastOptions
        );
      } finally {
        setBtn(0);
        setLoader('none');
      }
    }
  };

  // Ограничение максимальной даты для записи на месяц вперед
  const minDate = moment().tz(timeZone).format('YYYY-MM-DD');
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

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
                        <label htmlFor="type">Тип слота </label>
                        <select id="type" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                          <option value="consultation">Консультация</option>
                          <option value="treatment">Лечение</option>
                        </select>
                      </div>
                      {selectedType === 'consultation' && questions.length > 0 && (
                          <div className="in__container">
                            <h3>Вопросы от врача:</h3>
                            {questions.map((question, index) => (
                                <div key={index} className="question-container">
                                  <p>{question.question}</p>
                                  <div className="options-container">
                                    {question.options.map((option, i) => (
                                        <label key={i} className="option-label">
                                          <input
                                              type="radio"
                                              name={`question-${index}`}
                                              value={option}
                                              onChange={() => handleAnswerChange(index, option)}
                                              required
                                          />
                                          {option}
                                        </label>
                                    ))}
                                  </div>
                                </div>
                            ))}
                          </div>
                      )}
                      <div className="in__container">
                        <label>Выберите дату записи</label>
                        <input
                            type="date"
                            name="date"
                            style={{color: 'White' }}
                            value={activeUser.date}
                            min={ minDate }
                            max={maxDate.toISOString().split('T')[0]}
                            onChange={(event) => {
                              const selectedDate = event.target.value;
                              if (checkDate(selectedDate)) {
                                handleInputs(event);
                              }
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
                        <label>Адрес</label>
                        <input
                            type="text"
                            placeholder="Введите ваш адрес проживания"
                            name="address"
                            min="3"
                            value={activeUser.address}
                            onChange={handleInputs}
                        />
                      </div>
                      <div className="in__container">
                        <label>Номер телефона </label>
                        <PhoneInput
                            international
                            defaultCountry="RU"
                            value={activeUser.phone}
                            onChange={handleInputs}
                            required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="me_slot_selection">
                  <div className="bsc_lower_morning_container" ref={slotsRef}>
                    <div><span>Свободные слоты</span></div>
                    <div className="morning_info_container" id="container45" ref={slotsRef}>

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
                  <hr style={{ width: '100%' }}/>
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
