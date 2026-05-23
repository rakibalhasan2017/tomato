"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const restaurantroute_js_1 = __importDefault(require("./route/restaurantroute.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = new Set([process.env.CLIENT_URL, 'http://localhost:5173']
    .filter((origin) => Boolean(origin))
    .map((origin) => origin.replace(/\/$/, '')));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
}));
app.use('/api/restaurant', restaurantroute_js_1.default);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
    (0, db_1.default)();
});
