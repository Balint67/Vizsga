const express = require("express");
const { admin, db } = require("../firebaseAdmin");
const authenticateUser = require("../middleware/authenticateUser");

const router = express.Router();

function formatReview(doc) {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null;

    return {
        id: doc.id,
        name: data.name || "ForgeX User",
        text: data.text || "",
        rating: Number(data.rating || 5),
        userId: data.userId || null,
        createdAt
    };
}

router.get("/", async (req, res) => {
    try {
        const snapshot = await db
            .collection("reviews")
            .orderBy("createdAt", "desc")
            .get();

        return res.json(snapshot.docs.map(formatReview));
    } catch (error) {
        console.error("Ertekelesek lekerdezesi hiba:", error);
        return res.status(500).json({ message: "Nem sikerult betolteni az ertekeleseket." });
    }
});

router.post("/", authenticateUser, async (req, res) => {
    const { name, text, rating } = req.body;
    const numericRating = Number(rating || 5);

    if (!name || !text || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: "Hibas vagy hianyzo ertekelesi adatok." });
    }

    try {
        const review = {
            name: String(name).trim().slice(0, 80),
            text: String(text).trim().slice(0, 1000),
            rating: numericRating,
            userId: req.user.uid
        };

        const docRef = await db.collection("reviews").add({
            ...review,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(201).json({
            id: docRef.id,
            ...review,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Ertekeles mentese hiba:", error);
        return res.status(500).json({ message: "Nem sikerult menteni az ertekelest." });
    }
});

router.delete("/:id", authenticateUser, async (req, res) => {
    try {
        const reviewRef = db.collection("reviews").doc(req.params.id);
        const snapshot = await reviewRef.get();

        if (!snapshot.exists) {
            return res.status(404).json({ message: "Az ertekeles nem talalhato." });
        }

        if (snapshot.data().userId !== req.user.uid) {
            return res.status(403).json({ message: "Ezt az ertekelest csak a tulajdonosa torolheti." });
        }

        await reviewRef.delete();
        return res.json({ message: "Ertekeles torolve." });
    } catch (error) {
        console.error("Ertekeles torlese hiba:", error);
        return res.status(500).json({ message: "Nem sikerult torolni az ertekelest." });
    }
});

module.exports = router;
