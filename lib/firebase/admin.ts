import admin from "firebase-admin";

if (!admin.apps.length) {
  // Uses Application Default Credentials (ADC) locally — set up via:
  // gcloud auth application-default login
  //
  // On Vercel (production), ADC is provided automatically via
  // the GOOGLE_APPLICATION_CREDENTIALS environment variable or
  // Workload Identity Federation.
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID ?? "notes-of-tomorrow-e5dd7",
  });
}

export const adminAuth = admin.auth();
export const adminDb   = admin.firestore();
