// ============================================================
// CONFIGURAZIONE FIREBASE
// ============================================================
// Sostituisci i valori qui sotto con quelli del TUO progetto Firebase.
// Li trovi in: Firebase Console → Impostazioni progetto → Le tue app → Configurazione SDK
//
// NON preoccuparti se questi valori finiscono nel codice pubblico su GitHub:
// per le web app sono pensati per essere pubblici. La sicurezza vera è
// garantita dalle Firestore Security Rules (vedi firestore.rules), non da
// questi valori.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAgaM_9XjxNerXDHJAb7-ASzS9hf1OYIz8",
  authDomain: "thebeastgame.firebaseapp.com",
  projectId: "thebeastgame",
  storageBucket: "thebeastgame.firebasestorage.app",
  messagingSenderId: "964213992946",
  appId: "1:964213992946:web:e8570efb42fb453e684f6b",
  measurementId: "G-HB4YB5CG8Q"
};

firebase.initializeApp(firebaseConfig);
