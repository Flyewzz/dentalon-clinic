import EventService from "../Services/EventService";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ru'; // Подключение локализации
import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment";
import React from "react";
import ReactModal from "react-modal";

const localizer = momentLocalizer(moment);

class EventCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.eventService = new EventService();
        
        this.state = {
            events: [],
            modalIsOpen: false,
            selectedEvent: null,
        };

        this.messages = {
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
    }

    componentDidMount() {
        this.fetchEvents();
    }

    fetchEvents = async ({startTime, endTime} = getCurrentWeekRange()) => {
        const events = await this.eventService.fetchEvents(startTime, endTime);
        this.setState({ events: events });
    }

    handleRangeChange = (range) => {
        if (Array.isArray(range)) {
            const start = range[0];
            let end = 0;
            if (range.length === 1) {
                end = moment(start).endOf('day').toDate()
            } else {
                end = new Date(range[range.length - 1]);
            }
            
            this.fetchEvents({startTime: start, endTime: end});
            return
        }

        this.fetchEvents({startTime: range.start, endTime: range.end});
    };
    
    handleSelectEvent = (event) => {
        this.setState({
            selectedEvent: event,
            modalIsOpen: true
        });
    }
    
    closeModal = () => {
        this.setState({
            modalIsOpen: false,
            selectedEvent: null
        });
    };
    
    handleSelectSlot = ({ start, end }) => {
        // Пустой слот для создания нового события или блокировки
        this.setState({
            selectedEvent: { start, end, title: '', phone: '', email: '', isBlocked: false },
            modalIsOpen: true,
        });
    }

    handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        this.setState(prevState => ({
            selectedEvent: {
                ...prevState.selectedEvent,
                [name]: checked
            }
        }));
    }

    handleDeleteEvent = (id) => {
        this.setState(prevState => ({
            events: prevState.events.filter(event => event.id !== id),
            selectedEvent: null,
        }));
        this.closeModal();
    }

    handleSubmitChanges = (event) => {
        event.preventDefault();
        const form = event.target;
        const eventData = {
            id: this.state.selectedEvent.id,
            title: form.title.value,
            start: new Date(form.start.value),
            end: new Date(form.end.value),
            phone: form.phone.value,
            email: form.email.value,
            isBlocked: form.isBlocked.checked
        };

        if (eventData.id !== undefined) {
            const updatedEvent = this.eventService.updateEvent(eventData.id, eventData);
            if (updatedEvent) {
                const updatedEvents = this.state.events.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev);
                this.setState({ events: updatedEvents });
            }
        } else {
            const newEvent = this.eventService.addEvent(eventData);
            this.setState(prevState => ({
                events: [...prevState.events, newEvent]
            }));
        }
        this.closeModal();
    }

    render() {
        return (
            <>
                <button onClick={() => this.handleSelectSlot({ start: new Date(), end: new Date() })}>Добавить слот</button>
                <Calendar
                    localizer={localizer}
                    events={this.state.events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    selectable
                    onSelectEvent={this.handleSelectEvent}
                    onSelectSlot={this.handleSelectSlot}
                    onRangeChange={this.handleRangeChange}
                    components={{
                        event: EventWrapper
                    }}
                    messages={this.messages}
                    defaultView="week"
                />
                {this.state.modalIsOpen && (
                    <ReactModal
                        isOpen={this.state.modalIsOpen}
                        onRequestClose={this.closeModal}
                        contentLabel="Edit Appointment Slot"
                    >
                        <h2>{this.state.selectedEvent && this.state.selectedEvent.id !== undefined ? 'Редактировать слот' : 'Создать новый слот'}</h2>
                        <form onSubmit={(e) => {this.handleSubmitChanges(e);
                        }}>
                            <input className={'.doctor-dashboard'} type="text" name="title" defaultValue={this.state.selectedEvent?.title}
                                   placeholder="Название события или причина блокировки"/>
                            <input className={'.doctor-dashboard'} type="datetime-local" name="start"
                                   defaultValue={moment(this.state.selectedEvent?.start).format('YYYY-MM-DDTHH:mm')}/>
                            <input className={'.doctor-dashboard'} type="datetime-local" name="end"
                                   defaultValue={moment(this.state.selectedEvent?.end).format('YYYY-MM-DDTHH:mm')}/>
                            <input className={'.doctor-dashboard'} type="text" name="phone" defaultValue={this.state.selectedEvent?.phone} placeholder="Телефон"/>
                            <input className={'.doctor-dashboard'} type="email" name="email" defaultValue={this.state.selectedEvent?.email} placeholder="Email"/>
                            <label>
                                <input type="checkbox"
                                       name="isBlocked"
                                       checked={this.state.selectedEvent?.isBlocked || false}
                                       onChange={this.handleCheckboxChange}
                                />
                                Блокировать
                            </label>
                            <button
                                type="submit">{this.state.selectedEvent && this.state.selectedEvent.id !== undefined ? 'Сохранить изменения' : 'Добавить слот'}</button>
                        </form>
                        <button onClick={this.closeModal}>Отмена</button>
                        <button onClick={() => this.handleDeleteEvent(this.state.selectedEvent.id)}>Удалить</button>
                    </ReactModal>
                )}
            </>
        )
    }
}

function EventWrapper({ event }) {
    // Компонент для отображения каждого события в календаре
    return (
        <div style={{ background: event.isBlocked ? 'red' : 'green', padding: '5px' }}>
            {event.title}
        </div>
    );
}

function getCurrentWeekRange() {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return { startTime: startOfWeek, endTime: endOfWeek };
}

export default EventCalendar;