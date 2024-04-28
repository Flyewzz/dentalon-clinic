import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import './DoctorDashboard.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ru';  // Импорт русской локали

ReactModal.setAppElement('#root');

const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Весь день',
    previous: '<',
    next: '>',
    today: 'Сегодня',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    agenda: 'Повестка дня',
    date: 'Дата',
    time: 'Время',
    event: 'Событие', // Или другое слово по контексту
    showMore: total => `+ Показать ещё ${total}`
};

const MyCalendar = () => {
    const [events, setEvents] = useState([
        {
            id: 0,
            title: 'Петрасовна',
            start: new Date(2024, 3, 29, 10, 0),
            end: new Date(2024, 3, 29, 11, 0),
            isBlocked: false
        }
    ]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setModalIsOpen(true);
    };

    const handleContextMenuClick = (action, event) => {
        if (action === 'delete') {
            const newEvents = events.filter(e => e.id !== event.id);
            setEvents(newEvents);
        } else if (action === 'edit') {
            setSelectedEvent(event);
            setModalIsOpen(true);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedEvent(null);
    };

    const handleSubmitChanges = (event) => {
        event.preventDefault();
        const form = event.target;
        
        const eventData = {
            id: selectedEvent.id, // Убедитесь, что ID есть у selectedEvent
            title: form.title.value,
            start: new Date(form.start.value),
            end: new Date(form.end.value),
            phone: form.phone.value,
            email: form.email.value,
            isBlocked: form.isBlocked.checked
        };

        if (eventData.id !== undefined) {
            // Обновление существующего события
            const updatedEvents = events.map(event =>
                event.id === eventData.id ? { ...event, ...eventData } : event
            );
            setEvents(updatedEvents);
        } else {
            // Добавление нового события
            const newEvent = {
                ...eventData,
                id: Math.max(0, ...events.map(e => e.id)) + 1  // Установка нового уникального ID
            };
            setEvents(prevEvents => [...prevEvents, newEvent]);
        }
        closeModal();
    };
    
    const handleSelectSlot = ({ start, end }) => {
        // Пустой слот для создания нового события или блокировки
        setSelectedEvent({ start, end, title: '', phone: '', email: '', isBlocked: false });
        setModalIsOpen(true);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedEvent(prev => ({ ...prev, [name]: checked }));
    };

    const handleDeleteEvent = (id) => {
        setEvents(events.filter(event => event.id !== id));
        closeModal();
    };

    return (
        <div>
            <h1>Личный кабинет врача</h1>
            <button onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}>Добавить слот</button>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                components={{
                    event: EventWrapper
                }}
                messages={messages}
                defaultView="week"
            />
            {modalIsOpen && (
                <ReactModal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Edit Appointment Slot"
                >
                    <h2>{selectedEvent && selectedEvent.id !== undefined ? 'Редактировать слот' : 'Создать новый слот'}</h2>
                    <form onSubmit={(e) => {handleSubmitChanges(e);
                    }}>
                        <input type="text" name="title" defaultValue={selectedEvent?.title}
                               placeholder="Название события или причина блокировки"/>
                        <input type="datetime-local" name="start"
                               defaultValue={moment(selectedEvent?.start).format('YYYY-MM-DDTHH:mm')}/>
                        <input type="datetime-local" name="end"
                               defaultValue={moment(selectedEvent?.end).format('YYYY-MM-DDTHH:mm')}/>
                        <input type="text" name="phone" defaultValue={selectedEvent?.phone} placeholder="Телефон"/>
                        <input type="email" name="email" defaultValue={selectedEvent?.email} placeholder="Email"/>
                        <label>
                            <input type="checkbox"
                                   name="isBlocked"
                                   checked={selectedEvent?.isBlocked || false}
                                   onChange={handleCheckboxChange}
                            />
                            Блокировать
                        </label>
                        <button
                            type="submit">{selectedEvent && selectedEvent.id !== undefined ? 'Сохранить изменения' : 'Добавить слот'}</button>
                    </form>
                    <button onClick={closeModal}>Отмена</button>
                    <button onClick={() => handleDeleteEvent(selectedEvent.id)}>Удалить</button>
                </ReactModal>
            )}
        </div>
    );

    function EventWrapper({event}) {
        return (
            <ContextMenuTrigger id={`contextmenu-${event.id}`} collect={() => event}>
                <div style={{background: event.isBlocked ? 'red' : 'green', padding: '5px'}}>
                    {event.title}
                    <ContextMenu id={`contextmenu-${event.id}`}>
                        <MenuItem onClick={() => handleContextMenuClick('edit', event)}>Редактировать</MenuItem>
                        <MenuItem onClick={() => handleContextMenuClick('delete', event)}>Удалить</MenuItem>
                    </ContextMenu>
                </div>
            </ContextMenuTrigger>
        );
    }
};

export default MyCalendar;
