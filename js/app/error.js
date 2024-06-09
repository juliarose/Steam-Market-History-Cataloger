
/** Used to identify errors. */
export const ERROR_TYPE = Object.freeze({
    APP_ERROR: 'AppError',
    APP_SUCCESS_ERROR: 'AppSuccessError'
});

/**
 * Error class for handling error messages.
 */
export class AppError extends Error {
    /**
     * Creates an instance of AppError.
     * @param {string} message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = ERROR_TYPE.APP_ERROR;
    }
}

/**
 * Error class for handling success messages.
 */
export class AppSuccessError extends Error {
    /**
     * Creates an instance of AppSuccessError.
     * @param {string} message - The success message.
     */
    constructor(message) {
        super(message);
        this.name = ERROR_TYPE.APP_SUCCESS_ERROR;
    }
}
