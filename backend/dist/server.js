"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const path_1 = __importDefault(require("path"));
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/teacher_portal';
async function start() {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('MongoDB connected');
        const server = http_1.default.createServer(app_1.default);
        // Static file serving for uploads
        app_1.default.use('/uploads', require('express').static(path_1.default.join(process.cwd(), 'uploads')));
        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}
start();
