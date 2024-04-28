import React from 'react';
import LowerFooter from '../Components/LowerFooter';
import './Contact.css';
const Contact = () => {
  const clinic_data = [
    {
      id: 1,
      c_day: 'Понедельник',
      c_time: '10:00 - 16:00',
    },
    {
      id: 2,
      c_day: 'Вторник',
      c_time: '10:00 - 16:00',
    },
    {
      id: 3,
      c_day: 'Среда',
      c_time: '10:00 - 16:00',
    },
    {
      id: 4,
      c_day: 'Четверг',
      c_time: '10:00 - 16:00',
    },
    {
      id: 5,
      c_day: 'Пятница',
      c_time: '10:00 - 16:00',
    },
    {
      id: 6,
      c_day: 'Суббота',
      c_time: 'Выходной',
      color: 'red',
    },
    {
      id: 7,
      c_day: 'Воскресенье',
      c_time: 'Выходной',
      color: 'red',
    },
  ];
  return (
    <>
      <div className="contact_section_container" id="contact-us">
        <div className="container_container">
          <div className="google_map_location">
            <div className="gmap">
              <iframe
                  title="gmap_location"
                  className="gmap_iframe"
                  width="100%"
    
                  src="https://yandex.ru/map-widget/v1/-/CDV1mEi0"
                  style={{border: 0}}
              ></iframe>
            </div>
          </div>
          <div className="basic_contact_user_form">
            <div className="clinic_time_table">
              <h2 style={{fontFamily: 'Poppins'}}>
                <span>
                  <i className="fa-solid fa-angles-right"></i>
                </span>
                Часы работы
              </h2>
            </div>
            <hr/>
            {clinic_data.map((e, index) => (
              <div className="clinic_timing" key={index}>
                <p className="current_day">{e.c_day}</p>
                <p className="current_day_timing" style={{color: e.color}}>{e.c_time}</p>
              </div>
            ))}
            <div className="d_and_c">
              <div className="direction_to_clinic">
                <a
                  href="https://yandex.ru/maps/?ll=158.641171,53.05744&z=19.21&pt=158.640832,53.057836"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Как добраться
                </a>
              </div>
              <div className="call_to_clinic">
                <a href="tel:+74152267268">Позвонить</a>
              </div>
            </div>
          </div>
        </div>
        <LowerFooter />

        <div className="copyright_footer">
          <p>
            <span>
              <i className="fa-regular fa-copyright"></i>
            </span>
            2024
            <a href="/" id="clinic_name">
              Денталон
            </a>
            Все права защищены.
          </p>
        </div>
      </div>
    </>
  );
};

export default Contact;
