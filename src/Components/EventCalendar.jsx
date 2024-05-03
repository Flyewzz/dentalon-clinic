import EventService from "../Services/EventService";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ru'; // Подключение локализации
import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment";
import React from "react";
import ReactModal from "react-modal";
import EventSlotAdapter from "../Adapters/EventSlotAdapter";
import './EventCalendar.css';

const localizer = momentLocalizer(moment);

class EventCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.eventService = new EventService(props.baseUrl);
        this.eventSlotAdapter = new EventSlotAdapter();
        
        this.state = {
            events: [],
            modalIsOpen: false,
            selectedEvent: null,
            visibleRange: getCurrentWeekRange(),
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
        this.loadEvents();
    }

    loadEvents = async () => {
        const {start, end} = this.state.visibleRange;
        const events = await this.eventService.fetchEvents(start, end);
        this.setState({ events: events }, () => this.scrollToFirstEvent());
    }

    handleUpdateEvent = async (eventId, eventData) => {
        await this.eventService.updateEvent(eventId, eventData);
        await this.loadEvents();
    }

    handleAddEvent = async (eventData) => {
        const slot = this.eventSlotAdapter.eventToSlot(eventData);
        await this.eventService.addSlot(slot);
        await this.loadEvents();
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

            this.setState({ visibleRange: { start, end } }, () => this.loadEvents());
        } else {
            this.setState({ visibleRange: {start: range.start, end: range.end}}, () => this.loadEvents());
        }
    };

    scrollToFirstEvent = () => {
        // Поиск первого события в текущем видимом диапазоне
        const firstEvent = this.state.events.reduce((earliest, current) => {
            return current.start < earliest.start ? current : earliest;
        }, this.state.events[0]);

        // Обновление состояния для скроллинга к этому времени
        if (firstEvent) {
            this.setState({ scrollToTime: new Date(firstEvent.start) });
        }
    }
    
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

    handleDeleteEvent = async (eventId) => {
        await this.eventService.deleteEvent(eventId);
        await this.loadEvents();
        this.closeModal();
    }

    handleSubmitChanges = async (event) => {
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
            await this.handleUpdateEvent(eventData.id, eventData);
        } else {
            await this.handleAddEvent(eventData);
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
                    scrollToTime={this.state.scrollToTime || new Date()}  // Установка времени для скроллинга
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
                        <form className='doctor-dashboard-modal' onSubmit={(e) => {this.handleSubmitChanges(e);
                        }}>
                            <input type="text" name="title" defaultValue={this.state.selectedEvent?.title}
                                   placeholder="ФИО пациента или причина блокировки"/>
                            <input type="datetime-local" name="start"
                                   defaultValue={moment(this.state.selectedEvent?.start).format('YYYY-MM-DDTHH:mm')}/>
                            <input type="datetime-local" name="end"
                                   defaultValue={moment(this.state.selectedEvent?.end).format('YYYY-MM-DDTHH:mm')}/>
                            <input type="text" name="phone" defaultValue={this.state.selectedEvent?.phone} placeholder="Телефон"/>
                            <input type="email" name="email" defaultValue={this.state.selectedEvent?.email} placeholder="Email"/>
                            <label>
                                <input type="checkbox"
                                       name="isBlocked"
                                       checked={this.state.selectedEvent?.isBlocked || false}
                                       onChange={this.handleCheckboxChange}
                                />
                                Блокировать
                            </label>
                            <button
                                type="submit"
                            >
                                {this.state.selectedEvent && this.state.selectedEvent.id !== undefined ? 'Сохранить изменения' : 'Добавить слот'}
                            </button>
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
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return { start: startOfWeek, end: endOfWeek };
}

export default EventCalendar;