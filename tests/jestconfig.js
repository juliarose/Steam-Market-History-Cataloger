const path = require('path');

module.exports = {
    // go up one
    rootDir: path.join(__dirname, '..'),
    testEnvironment: 'node',
    setupFiles: [
        // mock localStorage
        'jest-localstorage-mock',
        '<rootDir>/tests/globals.js'
    ],
    moduleFileExtensions: [
        'js'
    ],
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    testMatch: [
        '**/*.test.js'
    ],
    transform: {
        '.*': '<rootDir>/node_modules/babel-jest'
    }
};