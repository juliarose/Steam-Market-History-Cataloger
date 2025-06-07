// @ts-check

/** Used to identify errors. */
export const ERROR_TYPE = Object.freeze({
    APP_ERROR: 'AppError',
    APP_SUCCESS: 'AppSuccess'
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
export class AppSuccess extends Error {
    /**
     * Creates an instance of AppSuccess.
     * @param {string} message - The success message.
     */
    constructor(message) {
        super(message);
        this.name = ERROR_TYPE.APP_SUCCESS;
    }
}
