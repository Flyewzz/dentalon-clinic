import EventService from "../Services/EventService";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ru'; // Подключение локализации
import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment";
import React from "react";
import ReactModal from "react-modal";
import EventSlotAdapter from "../Adapters/EventSlotAdapter";
import './EventCalendar.css';
import {Block} from "../Models/Event";
import BlockForm from "./Forms/BlockForm";
import SlotForm from "./Forms/SlotForm";
import EventFactory from "../Services/EventFactory";

const localizer = momentLocalizer(moment);

class EventCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.eventService = new EventService(props.baseUrl);
        this.eventSlotAdapter = new EventSlotAdapter();
        this.baseUrl = props.baseUrl;
        
        this.state = {
            events: [],
            modalIsOpen: false,
            selectedEvent: null,
            isBlock: false,
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
        let events = await this.eventService.fetchEvents(start, end);
        events = events.map(item => item.toJSON());
        this.setState({ events: events }, () => this.scrollToFirstEvent());
    }

    handleUpdateEvent = async (eventId, eventData) => {
        const slot = this.eventSlotAdapter.eventToSlot(eventData);
        await this.eventService.updateEvent(eventId, slot);
        await this.loadEvents();
    }

    handleUpdateBlock = async (blockId, blockData) => {
        // todo
        const slot = this.eventSlotAdapter.eventToSlot(blockData);
        await this.eventService.updateEvent(blockId, slot);
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

    handleSlotTypeChange = (event) => {
        const { name, value } = event.target;
        this.setState(prevState => ({
            selectedEvent: {
                ...prevState.selectedEvent,
                [name]: value
            }
        }));
    }

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
    
    handleDeleteEvent = async (eventId) => {
        await this.eventService.deleteEvent(eventId);
        await this.loadEvents();
        this.closeModal();
    }

    handleSubmitChanges = async (event) => {
        event.preventDefault();
        const form = event.target;
        const eventData = {
            title: form.title.value,
            start: new Date(form.start.value),
            end: new Date(form.end.value),
            phone: form.phone.value,
            email: form.email.value,
            type: form.type.value,
        };

        if (this.state.selectedEvent.id !== undefined) {
            eventData.id = this.state.selectedEvent.id;
            if (eventData.isBlocked) {
            } else {
                await this.handleUpdateEvent(eventData.id, eventData);
            }
        } else {
            await this.handleAddEvent(eventData);
        }
        this.closeModal();
    }

    handleSelectSlot = ({ start, end }) => {
        // Пустой слот для создания нового события или блокировки
        this.setState({
            selectedEvent: EventFactory.createSlot({ startTime: start, endTime: end }).toJSON(),
            modalIsOpen: true,
        });
    }

    eventStyleGetter = event => {
        const style = {
            backgroundColor: event instanceof Block ? 'red' : '#3174ad',
            borderRadius: '0px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    render() {
        return (
            <>
                <button onClick={() => this.handleSelectSlot({ start: new Date(), end: moment(new Date()).add(45, 'minutes').toDate() })}>Добавить слот</button>
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
                        <form className='doctor-dashboard-modal' onSubmit={(e) => {
                            this.handleSubmitChanges(e);
                        }}>
                            {this.state.selectedEvent && this.state.selectedEvent.isBlocked ? (
                                <BlockForm initialData={this.state.selectedEvent} />
                            ) : (
                                <SlotForm initialData={this.state.selectedEvent} baseUrl={this.baseUrl} />
                            )}
                            <button type="submit">
                                {this.state.selectedEvent && this.state.selectedEvent.id !== undefined ? 'Сохранить изменения' : 'Добавить событие'}
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
    // Определение стиля в зависимости от типа события
    const style = {
        backgroundColor: event.isBlocked ? 'red' : '#007bff',
        borderRadius: '0px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        whiteSpace: 'nowrap', // Убедитесь, что текст не переносится на новую строку
        padding: '5px'
    };

    return (
        <div style={style}>
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