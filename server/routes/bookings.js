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
        const snapshot = await db
            .collection("bookings")
            .where("userId", "==", req.user.uid)
            .get();

        const bookings = snapshot.docs
            .map(mapDoc)
            .sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`));

        return res.json(bookings);
    } catch (error) {
        console.error("Foglalasok lekerdezesi hiba:", error);
        return res.status(500).json({ message: "Nem sikerult betolteni a foglalasokat." });
    }
});

router.post("/", authenticateUser, async (req, res) => {
    const { userName, userEmail, trainer, course, date, time, note, weight, age } = req.body;

    if (!trainer || !course || !date || !time) {
        return res.status(400).json({ message: "Hianyzo foglalasi adatok." });
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
        console.error("Foglalas letrehozasi hiba:", error);
        return res.status(500).json({ message: "Nem sikerult elmenteni a foglalast." });
    }
});

router.delete("/:id", authenticateUser, async (req, res) => {
    try {
        const bookingRef = db.collection("bookings").doc(req.params.id);
        const snapshot = await bookingRef.get();

        if (!snapshot.exists) {
            return res.status(404).json({ message: "A foglalas nem talalhato." });
        }

        if (snapshot.data().userId !== req.user.uid) {
            return res.status(403).json({ message: "Ezt a foglalast csak a tulajdonosa torolheti." });
        }

        await bookingRef.delete();
        return res.json({ message: "Foglalas torolve." });
    } catch (error) {
        console.error("Foglalas torlesi hiba:", error);
        return res.status(500).json({ message: "Nem sikerult torolni a foglalast." });
    }
});

module.exports = router;
