// errors.js
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}

class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 500;
    }
}

module.exports = {
    NotFoundError,
    ValidationError,
    DatabaseError
};
