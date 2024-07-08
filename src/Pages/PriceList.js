// PriceList.jsx
import React from 'react';
import './PriceList.css';

const PriceList = () => {
    return (
        <div className="price-list-container">
            <h2>Прайс-лист</h2>

            <div className="disclaimer-container">
                <p className="disclaimer">Имеются противопоказания. Требуется консультация специалиста.</p>
                <p className="disclaimer">Окончательная стоимость лечения определяется после консультации. При записи на
                    лечение консультация производится бесплатно.</p>
            </div>
            
            <div className="section">
                <h3>Терапевтический прием</h3>
                <table className="price-table">
                    <thead>
                    <tr>
                        <th>№</th>
                        <th>Манипуляция</th>
                        <th>Стоимость, руб. (₽)</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>1</td>
                        <td>Консультация без/с оформлением сметы лечения</td>
                        <td>700,00 - 1 000,00</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Постановка прокладки</td>
                        <td>От 800,00</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Постановка световой пломбы</td>
                        <td>От 5 000,00</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td>Лечение одного корневого канала</td>
                        <td>От 2 500,00</td>
                    </tr>
                    <tr>
                        <td>5</td>
                        <td>Профессиональная чистка</td>
                        <td>От 6 500,00</td>
                    </tr>
                    <tr>
                        <td>6</td>
                        <td>Удаление старой пломбы</td>
                        <td>От 500,00</td>
                    </tr>
                    <tr>
                        <td>7</td>
                        <td>Карпульная анестезия</td>
                        <td>От 800,00</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h3>Ортопедический прием</h3>
                <table className="price-table">
                    <thead>
                    <tr>
                        <th>№</th>
                        <th>Манипуляция</th>
                        <th>Стоимость, руб. (₽)</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>1</td>
                        <td>Консультация без/с оформлением сметы лечения</td>
                        <td>700,00 - 1 000,00</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Снятие слепка с одной челюсти</td>
                        <td>1 500,00</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>Изготовление акрилового съёмного протеза</td>
                        <td>30 000,00</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td>Изготовление протеза из термоматериалов</td>
                        <td>От 40 000,00</td>
                    </tr>
                    <tr>
                        <td>5</td>
                        <td>Изготовление бюгельного протеза</td>
                        <td>От 55 000,00</td>
                    </tr>
                    <tr>
                        <td>6</td>
                        <td>Изготовление пластмассовой коронки</td>
                        <td>От 6 500,00</td>
                    </tr>
                    <tr>
                        <td>7</td>
                        <td>Изготовление литой коронки</td>
                        <td>От 7 000,00</td>
                    </tr>
                    <tr>
                        <td>8</td>
                        <td>Изготовление металлокерамической коронки</td>
                        <td>От 12 000,00</td>
                    </tr>
                    <tr>
                        <td>9</td>
                        <td>Фиксация коронок (за единицу)</td>
                        <td>От 1 400,00</td>
                    </tr>
                    <tr>
                        <td>10</td>
                        <td>Изготовление временных коронок</td>
                        <td>От 1 200,00</td>
                    </tr>
                    <tr>
                        <td>11</td>
                        <td>Изготовление коронки из диоксида циркония</td>
                        <td>От 17 000,00</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PriceList;
