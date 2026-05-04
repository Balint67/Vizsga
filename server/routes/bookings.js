const express = require("express");
const { admin, db } = require("../firebaseAdmin");
const authenticateUser = require("../middleware/authenticateUser");

const router = express.Router();

function mapDoc(doc) {
    const data = doc.data();

    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null
    };
}

router.get("/", authenticateUser, async (req, res) => {
    try {
        const byUserIdSnapshot = await db
            .collection("bookings")
            .where("userId", "==", req.user.uid)
            .get();
        const bookingsById = new Map();

        byUserIdSnapshot.docs.map(mapDoc).forEach((booking) => {
            bookingsById.set(booking.id, booking);
        });

        if (req.user.email) {
            const byEmailSnapshot = await db
                .collection("bookings")
                .where("userEmail", "==", req.user.email)
                .get();

            byEmailSnapshot.docs.map(mapDoc).forEach((booking) => {
                bookingsById.set(booking.id, booking);
            });
        }

        const bookings = Array.from(bookingsById.values())
            .sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`));

        return res.json(bookings);
    } catch (error) {
        console.error("Booking query error:", error);
        return res.status(500).json({ message: "Nem sikerült betölteni a foglalásokat." });
    }
});

router.post("/", authenticateUser, async (req, res) => {
    const { userName, userEmail, trainer, course, date, time, note, weight, age } = req.body;

    if (!trainer || !course || !date || !time) {
        return res.status(400).json({ message: "Hiányzó foglalási adatok." });
    }

    try {
        const booking = {
            userId: req.user.uid,
            userName: userName || "",
            userEmail: userEmail || req.user.email || "",
            trainer,
            course,
            date,
            time,
            note: note || "",
            weight: Number(weight || 0),
            age: Number(age || 0)
        };

        const docRef = await db.collection("bookings").add({
            ...booking,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(201).json({
            id: docRef.id,
            ...booking,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Booking creation error:", error);
        return res.status(500).json({ message: "Nem sikerült elmenteni a foglalást." });
    }
});

router.delete("/:id", authenticateUser, async (req, res) => {
    try {
        const bookingRef = db.collection("bookings").doc(req.params.id);
        const snapshot = await bookingRef.get();

        if (!snapshot.exists) {
            return res.status(404).json({ message: "A foglalás nem található." });
        }

        const booking = snapshot.data();

        if (booking.userId !== req.user.uid && booking.userEmail !== req.user.email) {
            return res.status(403).json({ message: "Ezt a foglalást csak a tulajdonosa törölheti." });
        }

        await bookingRef.delete();
        return res.json({ message: "Foglalás törölve." });
    } catch (error) {
        console.error("Booking deletion error:", error);
        return res.status(500).json({ message: "Nem sikerült törölni a foglalást." });
    }
});

module.exports = router;
