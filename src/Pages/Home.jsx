import React from "react";
import "./Home.css";
import "font-awesome/css/font-awesome.min.css";
import slider_one from "../Pages/images/slide_one.png";
import { HashLink } from "react-router-hash-link";

const Home = () => {
  return (
    <>
      <section id="home">
        <div className="slider_container">
          <div className="slider-images">
            <div className="slider_image">
              <img
                className="w-100"
                src={slider_one}
                alt="First slide"
                data-aos="fade-down"
              />
            </div>

            <div className="front_container">
              <div className="front_page_info">
                <h2
                  style={{
                    fontSize: "51px",
                    margin: "0",
                    textAlign: "left",
                    lineHeight: "1.2",
                    color: "hsl(218, 70%, 18%);",
                  }}
                >
                  Мы заботимся о вашей улыбке
                </h2>
                <p>
                  Мы считаем, что каждый должен иметь доступ к отличным доступным стоматологическим услугам.
                </p>
                <div className="social_links"></div>
              </div>
              <div className="slider_controls">
                <div className="circle_dot_class">
                  <span></span>
                </div>
                <div className="circle_dot_class">
                  <span></span>
                </div>
                <div className="circle_dot_class">
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="clinic_container">
          <div className="clinic_info">
            <div className="basic_info" id="info_01">
              <h2>Гибкий график</h2>
              <p>
                Иногда мы работаем по праздникам и воскресеньям.
                В случае чрезвычайных ситуаций мы принимаем заказы.
              </p>

              <HashLink
                to={"/register"}
                style={{ textDecoration: "none", color: "#fff" }}
              >
                <div className="transperent_btn"> Чат с врачом</div>
              </HashLink>
            </div>
            <div className="basic_info" id="info_02">
              <h2>Гарантия лучшей цены</h2>
              <p>
                Наши приятные цены заставили тысячи людей улыбнуться с новой,
                красивой, неотразимой улыбкой!
              </p>
              <HashLink
                to={"/#contact-us"}
                style={{ textDecoration: "none", color: "#fff" }}
              >
                <div className="transperent_btn">Подробнее</div>
              </HashLink>
            </div>
            <div className="basic_info" id="info_03">
              <h2>Часы работы</h2>
              <p>
                Понедельник – Суббота : 10.00 – 16.00
              </p>

              <HashLink
                to={"/dental-clinic/slot"}
                style={{ textDecoration: "none", color: "#fff" }}
              >
                <div className="transperent_btn" id="tr_btn_01">
                  Записаться на прием
                </div>
              </HashLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
