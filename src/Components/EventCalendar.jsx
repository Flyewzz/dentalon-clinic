import EventService from "../Services/EventService";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ru'; // Подключение локализации
import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment";
import React from "react";
import ReactModal from "react-modal";
import EventSlotAdapter from "../Adapters/EventSlotAdapter";
import './EventCalendar.css';
import BlockForm from "./Forms/BlockForm";
import SlotForm from "./Forms/SlotForm";
import EventFactory from "../Services/EventFactory";
import EventBlockAdapter from "../Adapters/EventBlockAdapter";

const localizer = momentLocalizer(moment);

class EventCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.eventService = new EventService(props.baseUrl);
        this.eventSlotAdapter = new EventSlotAdapter();
        this.eventBlockAdapter = new EventBlockAdapter();
        this.baseUrl = props.baseUrl;
        
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
        const [fetchedEvents, fetchedBlocks] = await Promise.all([
            this.eventService.fetchEvents(start, end),
            this.eventService.fetchBlocks(start, end),
        ])
        
        const events = [...fetchedEvents, ...fetchedBlocks].map(item => item.toJSON());
        this.setState({ events: events }, () => this.scrollToFirstEvent());
    }

    handleUpdateEvent = async (eventData) => {
        if (eventData.isBlocked) {
            const block = this.eventBlockAdapter.eventToBlock(eventData);
            await this.eventService.updateBlock(eventData.id, block);
        } else {
            const slot = this.eventSlotAdapter.eventToSlot(eventData);
            await this.eventService.updateEvent(eventData.id, slot);
        }
        
        await this.loadEvents();
    }

    handleAddEvent = async (eventData) => {
        if (eventData.isBlocked) {
            const block = this.eventBlockAdapter.eventToBlock(eventData);
            await this.eventService.addBlock(block);
        } else {
            const slot = this.eventSlotAdapter.eventToSlot(eventData);
            await this.eventService.addSlot(slot);
        }
        
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
    
    handleDeleteEvent = async (eventId) => {
        if (this.state.selectedEvent.isBlocked) {
            await this.eventService.deleteBlock(eventId);
        } else {
            await this.eventService.deleteEvent(eventId);
        }
        
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
        };

        if (this.state.selectedEvent !== undefined) {
            eventData.isBlocked = this.state.selectedEvent.isBlocked;
        }
        
        if (!eventData.isBlocked) {
            eventData.phone = form.phone.value;
            eventData.email = form.email.value;
            eventData.type = form.type.value;
            // eventData.questions = this.state.selectedEvent.questions; // добавляем вопросы и ответы
        }
        
        if (this.state.selectedEvent.id !== undefined) {
            eventData.id = this.state.selectedEvent.id;
            await this.handleUpdateEvent(eventData);
        } else {
            await this.handleAddEvent(eventData);
        }
        
        this.closeModal();
    }

    handleSelectSlot = ({ start, end }) => {
        // Пустой слот для создания нового события или блокировки
        let selectedEvent;

        const duration = moment(end).diff(moment(start), 'hours');
        if (duration < 12) {
            selectedEvent = EventFactory.createSlot({ startTime: start, endTime: end }).toJSON();
        } else {
            selectedEvent = EventFactory.createBlock({ startTime: start, endTime: end }).toJSON();
        }

        this.setState({
            selectedEvent: selectedEvent,
            modalIsOpen: true,
        });
    }

    handleSelectBlock = (blockInfo) => {
        this.setState({
            modalIsOpen: true,
            selectedEvent: EventFactory.createBlock({ startTime: blockInfo.start, endTime: blockInfo.end }).toJSON(),
        });
    };
    
    render() {
        return (
            <>
                <button onClick={() => this.handleSelectSlot({
                    start: new Date(),
                    end: moment(new Date()).add(45, 'minutes').toDate()
                })}>Добавить слот
                </button>
                <button onClick={() => this.handleSelectBlock({start: new Date(), end: new Date()})}>Добавить
                    блокировку
                </button>
                <Calendar
                    localizer={localizer}
                    events={this.state.events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{height: 500}}
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
                                <BlockForm initialData={this.state.selectedEvent}/>
                            ) : (
                                <SlotForm initialData={this.state.selectedEvent} baseUrl={this.baseUrl}/>
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

function EventWrapper({event}) {
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
    // Получаем начало текущей недели, учитывая часовой пояс
    const startOfWeek = moment().startOf('week').toDate(); // начало недели

    // Конец недели - это начало следующей недели минус одна миллисекунда
    const endOfWeek = moment(startOfWeek).add(1, 'week').subtract(1, 'millisecond').toDate();

    // Обнуление времени для обоих значений
    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(23, 59, 59, 999); // Устанавливаем конец дня для endOfWeek

    return { start: startOfWeek, end: endOfWeek };
}


export default EventCalendar;