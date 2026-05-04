require("dotenv").config({ path: "./server/.env" });

const express = require("express");
const cors = require("cors");
const bookingsRouter = require("./routes/bookings");
const reviewsRouter = require("./routes/reviews");

const app = express();
const port = Number(process.env.PORT || 3000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:8080";
const allowedOrigins = new Set([
    clientOrigin,
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://localhost:63342",
    "http://127.0.0.1:63342",
    "https://forgex-2026.firebaseapp.com",
    "https://forgex-2026.web.app"
]);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS origin is not allowed."));
    },
    credentials: true
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "ForgeX REST API"
    });
});

app.use("/api/bookings", bookingsRouter);
app.use("/api/reviews", reviewsRouter);

app.use((req, res) => {
    res.status(404).json({ message: "Az API végpont nem található." });
});

app.use((error, req, res, next) => {
    console.error("Unexpected server error:", error);
    res.status(500).json({ message: "Váratlan szerverhiba történt." });
});

app.listen(port, () => {
    console.log(`ForgeX REST API fut: http://localhost:${port}`);
});
