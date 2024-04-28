import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import './DoctorDashboard.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import 'react-big-calendar/lib/css/react-big-calendar.css';

ReactModal.setAppElement('#root'); // Указываем корневой элемент для доступности

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [events, setEvents] = useState([
        {
            id: 0,
            title: 'Встреча с клиентом',
            start: new Date(2024, 3, 29, 10, 0),
            end: new Date(2024, 3, 29, 11, 0)
        },
        // Добавьте другие события здесь
    ]); // Предопределенный список событий
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setModalIsOpen(true);
    };

    const handleContextMenuClick = (action, event) => {
        switch (action) {
            case 'edit':
                alert(`Редактирование: ${event.title}`);
                break;
            case 'delete':
                const newEvents = events.filter(e => e.id !== event.id);
                setEvents(newEvents);
                alert(`Удалено: ${event.title}`);
                break;
            default:
                break;
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedEvent(null);
    };

    const handleSubmitChanges = (eventData) => {
        const updatedEvents = events.map(event =>
            event.id === eventData.id ? { ...event, ...eventData } : event
        );
        setEvents(updatedEvents);
        closeModal();
    };

    return (
        <div>
            <h1>Личный кабинет врача</h1>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectEvent={handleSelectEvent}
                components={{
                    event: EventWrapper
                }}
            />
            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Edit Appointment Slot"
            >
                <h2>Редактирование слота</h2>
                {/* Форма для редактирования слота */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log(e.target.start.value);
                    console.log(typeof(e.target.start.value));
                    
                    handleSubmitChanges({
                        ...selectedEvent,
                        title: e.target.title.value, // Пример поля
                        start: new Date(e.target.start.value),
                        end: new Date(e.target.end.value)
                    });
                }}>
                    <input type="text" name="title" defaultValue={selectedEvent?.title} />
                    <input type="datetime-local" name="start" defaultValue={moment(selectedEvent?.start).add(4, 'hour').toISOString().slice(0,16)} />
                    <input type="datetime-local" name="end" defaultValue={moment(selectedEvent?.end).add(4, 'hour').toISOString().slice(0,16)} />
                    <button type="submit">Сохранить изменения</button>
                </form>
                <button onClick={closeModal}>Отмена</button>
            </ReactModal>
        </div>
    );

    function EventWrapper({ event }) {
        return (
            <ContextMenuTrigger id={`contextmenu-${event.id}`} collect={() => event}>
                <div>
                    {event.title}
                    <ContextMenu id={`contextmenu-${event.id}`}>
                        <MenuItem onClick={() => handleSelectEvent(event)}>
                            Редактировать
                        </MenuItem>
                        <MenuItem onClick={() => handleContextMenuClick('delete', event)}>
                            Удалить
                        </MenuItem>
                    </ContextMenu>
                </div>
            </ContextMenuTrigger>
        );
    }
};

export default MyCalendar;
