import path from 'path';

export default {
    // go up one
    rootDir: path.join('..'),
    testEnvironment: 'node',
    setupFiles: [
        // mock localStorage
        '<rootDir>/node_modules/regenerator-runtime/runtime',
        'jest-localstorage-mock',
        '<rootDir>/tests/globals.js',
        '<rootDir>/tests/jestconfig.js'
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