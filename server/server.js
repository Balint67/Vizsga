require("dotenv").config({ path: "./server/.env" });

const express = require("express");
const cors = require("cors");
const bookingsRouter = require("./routes/bookings");
const reviewsRouter = require("./routes/reviews");

const app = express();
const port = Number(process.env.PORT || 3000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:8080";

app.use(cors({
    origin: clientOrigin,
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
    res.status(404).json({ message: "API vegpont nem talalhato." });
});

app.use((error, req, res, next) => {
    console.error("Varatlan szerverhiba:", error);
    res.status(500).json({ message: "Varatlan szerverhiba tortent." });
});

app.listen(port, () => {
    console.log(`ForgeX REST API fut: http://localhost:${port}`);
});
