const { admin } = require("../firebaseAdmin");

async function authenticateUser(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Hiányzik az azonosítási token." });
    }

    try {
        req.user = await admin.auth().verifyIdToken(token);
        return next();
    } catch (error) {
        console.error("Firebase ID token verification error:", error);
        return res.status(401).json({ message: "Érvénytelen vagy lejárt azonosítási token." });
    }
}

module.exports = authenticateUser;
