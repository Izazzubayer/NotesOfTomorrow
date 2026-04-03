import admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "notes-of-tomorrow-e5dd7";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } else if (projectId && !process.env.VERCEL) {
    // Only use ADC if we're not on Vercel build environment, 
    // or if we explicitly want to allow it.
    // VERCEL is usually set in Vercel environments.
    admin.initializeApp({ projectId });
  } else {
     // During build, just use a dummy or skip if it might crash
     console.warn("Firebase Admin: No credentials provided and in Vercel/CI environment. Skipping full initialization.");
     // We can initialize with just the projectId if we must, but it might still fail if used.
     // For build, it's often safer to just leave it uninitialized if not needed.
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminDb   = admin.apps.length ? admin.firestore() : null as any;
