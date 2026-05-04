const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

function resolveServiceAccountPath() {
    const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        || process.env.GOOGLE_APPLICATION_CREDENTIALS
        || "./server/serviceAccountKey.json";

    return path.isAbsolute(configuredPath)
        ? configuredPath
        : path.resolve(process.cwd(), configuredPath);
}

function createCredential() {
    const serviceAccountPath = resolveServiceAccountPath();

    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        return admin.credential.cert(require(serviceAccountPath));
    }

    return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: createCredential(),
        projectId: process.env.FIREBASE_PROJECT_ID || "forgex-2026"
    });
}

const db = admin.firestore();

module.exports = { admin, db };
