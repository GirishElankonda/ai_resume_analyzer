const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

let connectionPromise;

function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }

    if (!process.env.MONGO_URI) {
        return Promise.reject(new Error('MONGO_URI is not configured'));
    }

    if (mongoose.connection.readyState !== 2) {
        connectionPromise = undefined;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            bufferCommands: false,
        })
            .then((connection) => {
                console.log('Database Connected Successfully');
                return connection;
            })
            .catch((error) => {
                connectionPromise = undefined;
                throw error;
            });
    }

    return connectionPromise;
}

module.exports = { connectDB };