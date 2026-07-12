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
  apiKey: "INSERISCI_QUI_LA_TUA_API_KEY",
  authDomain: "INSERISCI_QUI.firebaseapp.com",
  projectId: "INSERISCI_QUI_IL_PROJECT_ID",
  storageBucket: "INSERISCI_QUI.appspot.com",
  messagingSenderId: "INSERISCI_QUI",
  appId: "INSERISCI_QUI"
};

firebase.initializeApp(firebaseConfig);
