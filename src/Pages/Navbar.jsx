import React, {useEffect, useState} from 'react';
import logo_img from './images/logo.png';
import { HashLink } from 'react-router-hash-link';
import 'font-awesome/css/font-awesome.min.css';
import './Navbar.css';
const Navbar = () => {
  const [isActive, setActive] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setAuthenticated(!!token);  // Если токен есть, пользователь считается аутентифицированным
  }, []);
  
  const handleClick = () => {
    setActive(!isActive);
  };

  const closeMobileMenu = () => {
    setActive(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthenticated(false);
    closeMobileMenu();
  };
  
  return (
    <>
      <div className="nav-container">
        <div className="logo">
          <HashLink to="/#home">
            <img src={logo_img} alt="om dental clinic logo" />
          </HashLink>
          <h2>Денталон</h2>
        </div>
        <div className={isActive ? 'active_links' : 'links'}>
          <div className="MenuItems">
            <HashLink to="/#home" onClick={closeMobileMenu}>
              Главная
            </HashLink>
          </div>
          <div className="MenuItems">
            <HashLink to="/#about-doctors" onClick={closeMobileMenu}>
              О нас
            </HashLink>
          </div>
          <div className="MenuItems">
            <HashLink to="/#our-services" onClick={closeMobileMenu}>
              Услуги
            </HashLink>
          </div>
          {/*{ !isAuthenticated &&*/}
          {/*<div className="MenuItems">*/}
          {/*  <HashLink to="/register" onClick={closeMobileMenu}>*/}
          {/*    Регистрация*/}
          {/*  </HashLink>*/}
          {/*</div>*/}
          {/*}*/}
          { !isAuthenticated &&
          <div className="MenuItems">
            <HashLink to="/login_user" onClick={closeMobileMenu}>
              Войти
            </HashLink>
          </div>
          }
          <div className="MenuItems">
            <HashLink to="/#contact-us" onClick={closeMobileMenu}>
              Контакты
            </HashLink>
          </div>
          { isAuthenticated &&
              (
                  <>
                    <div className="MenuItems">
                      <HashLink to="/dental-clinic/doctor-dashboard" onClick={closeMobileMenu}>
                        Профиль
                      </HashLink>
                    </div>
                    <div className="MenuItems">
                      <HashLink to="/" onClick={handleLogout}>
                        Выйти
                      </HashLink>
                    </div>
                  </>
              )
          }
          { !isAuthenticated &&
            <div className="MenuItems bgMenu" id="Appointment_menu">
              <HashLink to="/dental-clinic/slot" onClick={closeMobileMenu}>
                Запись
              </HashLink>
            </div>
          }
        </div>
        <div className="toggle_menu_icons" onClick={handleClick}>
          <i className={isActive ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>
      </div>
    </>
  );
};

export default Navbar;
