import EventFactory from "./EventFactory";
import {toast} from "react-toastify";

class EventService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl; // URL вашего API;
        this.toastOptions = {
            position: "top-right",
            autoClose: 4000,
            pauseOnHover: true,
            draggable: true,
            // theme: "dark",
        };
    }

    // Вспомогательная функция для проверки статуса ответа и показа сообщения об ошибке
    async checkStatus(response) {
        if (!response.ok) { // response.ok -> статус в диапазоне 200-299
            try {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Что-то пошло не так';
                toast.error(`Ошибка: ${errorMessage}`, this.toastOptions);
                return Promise.reject(new Error(errorMessage));
            } catch (e) {
                // В случае, если не удалось извлечь JSON с ошибкой
                toast.error(`Ошибка: Неизвестная ошибка сервера`, this.toastOptions);
                return Promise.reject(new Error('Неизвестная ошибка сервера'));
            }
        }
        return response;
    }
    
    login(res) {
        const accessToken = res.headers.get('X-Access-Token');
        const refreshToken = res.headers.get('X-Refresh-Token');
        
        if (accessToken && refreshToken) {
            localStorage.setItem('X-Access-Token', accessToken);
            localStorage.setItem('X-Refresh-Token', refreshToken);
        }
    }

    getTokens() {
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken')
        };
    }

    async authenticatedRequest(url, options = {}) {
        const tokens = this.getTokens();
        const headers = new Headers(options.headers || {});
        headers.append('Authorization', `Bearer ${tokens.accessToken}`);
        headers.append('Content-Type', 'application/json');
        headers.append('X-Refresh-Token', tokens.refreshToken);

        const response = await fetch(url, { ...options, headers });
        this.login(response); // Обновить токены если нужно
        
        return response;
    }
    
    async fetchEvents(start, end, doctorId = 1) {
        try {
            start = start.toISOString();
            end = end.toISOString();

            const response = await this.authenticatedRequest(
                `${this.baseUrl}/appointments/slots?startTime=${start}&endTime=${end}`
            );
            
            const data = await response.json();
            return data.map(item => EventFactory.createSlot(item));
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error(`Ошибка получения слотов: ${error.message}`, this.toastOptions);
            return [];  // Возвращаем пустой массив в случае ошибки
        }
    }

    async fetchBlocks(start, end) {
        try {
            start = start.toISOString();
            end = end.toISOString();
            
            const response = await this.authenticatedRequest(`${this.baseUrl}/blocks?startTime=${start}&endTime=${end}`);
            
            const data = await response.json();
            return data.map(blockData => EventFactory.createBlock(blockData));
        } catch (error) {
            console.error('Error fetching blocks:', error);
            toast.error(`Ошибка получения блокировок: ${error.message}`, this.toastOptions);
             return [];
        }
    }

    async addBlock(blockData)  {
        try {
            const response = await this.authenticatedRequest(`${this.baseUrl}/blocks`, {
                method: 'POST',
                body: JSON.stringify(blockData)
            });

            await this.checkStatus(response);
            return await response.json();
        } catch (error) {
            toast.error(`Ошибка создания блокировки: ${error.message}`, this.toastOptions);
            return null;
        }
    };
    
    async addSlot(slotData)  {
        try {
            const response = await this.authenticatedRequest(`${this.baseUrl}/appointments`, {
                method: 'POST',
                body: JSON.stringify(slotData)
            });

            return await response.json();
        } catch (error) {
            toast.error(`Ошибка создания блокировки: ${error.message}`, this.toastOptions);
            return null;
        }
    };

    async updateEvent(id, eventData) {
        try {
            const response = await this.authenticatedRequest(`${this.baseUrl}/appointments/${id}`, {
                method: 'PUT',
                body: JSON.stringify(eventData)
            });

            this.login(response);
            await this.checkStatus(response);
            
            return await response.json();
        } catch (error) {
            toast.error(`Ошибка изменения записи: ${error.message}`, this.toastOptions);
            return null;
        }
    }

    async updateBlock(id, blockData) {
        try {
            const response = await this.authenticatedRequest(`${this.baseUrl}/blocks/${id}`, {
                method: 'PUT',
                body: JSON.stringify(blockData)
            });

            this.login(response);
            await this.checkStatus(response);
            
            return await response.json();
        } catch (error) {
            toast.error(`Ошибка изменения блокировки: ${error.message}`, this.toastOptions);
            return null;
        }
    }
    
    async deleteEvent(id) {
        try {
            const response = await this.authenticatedRequest(`${this.baseUrl}/appointments/${id}`, {
                method: 'DELETE',
            });
            
            this.login(response);
            await this.checkStatus(response);
            
            return await response.json();
        }
        catch (error) {
            toast.error(`Ошибка удаления записи: ${error.message}`, this.toastOptions);
            return null;
        }
    }

    async deleteBlock(id) {
        try {
            const response = await this.authenticatedRequest(`${this.baseUrl}/blocks/${id}`, {
                method: 'DELETE',
            });
    
            this.login(response);
            await this.checkStatus(response);
        }
        catch (error) {
            toast.error(`Ошибка удаления блокировки: ${error.message}`, this.toastOptions);
            return null;
        }
    }
}

export default EventService;