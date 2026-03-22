import admin from "firebase-admin";

if (!admin.apps.length) {
  // Check if we have explicit credentials (usually on Vercel)
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID ?? "notes-of-tomorrow-e5dd7",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Uses Application Default Credentials (ADC) locally (e.g., via gcloud auth)
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID ?? "notes-of-tomorrow-e5dd7",
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb   = admin.firestore();
