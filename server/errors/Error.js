// errors.js
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
        this.isOperational = true; // Для определения, что ошибка "управляемая"
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.isOperational = true;
    }
}

class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 500;
        this.isOperational = true;
    }
}

module.exports = {
    NotFoundError,
    ValidationError,
    DatabaseError
};
