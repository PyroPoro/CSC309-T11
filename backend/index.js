import express from "express";
import routes from "./routes.js";
import cors from "cors";
import 'dotenv/config';

const app = express();

// 1. .trim() removes any invisible spaces accidentally copied into the Railway dashboard!
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").trim();

// 2. Define bulletproof CORS options
const corsOptions = {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow your headers
    credentials: true
};

// 3. Apply CORS middleware to all routes
app.use(cors(corsOptions));

// 4. Explicitly handle the preflight requests globally
app.options('*', cors(corsOptions));

app.use(express.json());

// 5. Debugging middleware: This will print the exact comparison in your Railway logs!
app.use((req, res, next) => {
    // Only log once per request cycle
    if (req.method !== 'OPTIONS') {
        console.log(`--- Incoming ${req.method} request ---`);
        console.log(`Browser Origin: "${req.headers.origin}"`);
        console.log(`Backend Expects: "${FRONTEND_URL}"`);
        console.log(`Are they an exact match?: ${req.headers.origin === FRONTEND_URL}`);
    }
    next();
});

app.use('', routes);

export default app;