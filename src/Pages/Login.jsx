import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import Logo from '../assets/logo.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import Spinner from '../Components/Spinner';
const Login = () => {
  // const url = "http://localhost:5000/login_user";
  const url = 'http://192.168.10.16:5001/login_user';
  const navigate = useNavigate();

  const [loader, setLoader] = useState('none');
  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const toastOptions = {
    position: 'top-right',
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
  };

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleValidation = () => {
    const { email, password } = values;
    if (password === '') {
      toast.error('Password is required', toastOptions);
      return false;
    } else if (email === '') {
      toast.error('email and password is required', toastOptions);
      return false;
    }
    return true;
  };

  const PostData = async (event) => {
    event.preventDefault();

    const { email, password } = values;

    const request_login_options = { email, password };

    if (handleValidation()) {
      setLoader('flex');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request_login_options),
      });

      const data = await res.json();

      if (data) {
        setLoader('none');
      }

      if (res.status !== 201) {
        toast.error(data.message, toastOptions);
      } else {
        // Сохраняем полученные токены в localStorage или sessionStorage
        localStorage.setItem('accessToken', res.headers.get('X-Access-Token'));
        localStorage.setItem('refreshToken', res.headers.get('X-Refresh-Token'));
        toast.error('Вы успешно вошли в систему', toastOptions);
        // Задержка перед редиректом
        setTimeout(() => {
          navigate("/");
        }, 1500);  // Задержка в 1500 миллисекунд (1.5 секунды)
      }
    }
  };

  return (
    <>
      <div className="login_form_section">
        <div className="form_container_for_login">
          <form method="POST" className="login_u_form" onSubmit={PostData}>
            <div className="brand">
              <img src={Logo} alt="logo" />
              <h1>Om Dental Clinic</h1>
            </div>
            <input
              type="text"
              className="login"
              placeholder="Enter your Email"
              name="email"
              onChange={(e) => handleChange(e)}
            />
            <input
              type="Password"
              className="login"
              placeholder="Password"
              name="password"
              onChange={(e) => handleChange(e)}
            />
            <button className="login_form_button" type="submit">
              Login In
              <Spinner id="login_loder" style={loader} />
            </button>
            <span className="lower_title_login">
              Don't have an account?
              <HashLink to={'/register'}>Register</HashLink>
            </span>
          </form>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Login;
