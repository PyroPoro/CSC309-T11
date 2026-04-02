import express from "express";
import routes from "./routes.js";
import cors from "cors";
import 'dotenv/config';
// TODO: complete me (loading the necessary packages)

const app = express();

// TODO: complete me (CORS)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // Enable this if you are using cookies/sessions
}));

app.use(express.json());
app.use('', routes);

export default app;