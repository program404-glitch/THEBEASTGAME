# Beast Pocket — Setup Firebase

Questi passaggi collegano il gioco a un vero backend gratuito (Firebase), così gli account funzionano su qualsiasi dispositivo.

## 1. Crea il progetto Firebase

1. Vai su [console.firebase.google.com](https://console.firebase.google.com) e accedi con un account Google.
2. Clicca **"Aggiungi progetto"**, dagli un nome (es. `beast-pocket`), procedi con le impostazioni di default.
3. Una volta creato, nella home del progetto clicca l'icona **`</>`** (Web) per registrare una nuova web app. Dalle un nickname qualsiasi, **non serve** Firebase Hosting.
4. Firebase ti mostrerà un blocco `firebaseConfig = {...}`: copia questi valori.

## 2. Compila `firebase-config.js`

Apri il file `firebase-config.js` che ti ho generato e sostituisci i valori placeholder con quelli copiati al punto precedente (apiKey, authDomain, projectId, ecc.).

## 3. Attiva Authentication

1. Nel menu laterale della Console Firebase vai su **Build → Authentication**.
2. Clicca **"Inizia"**.
3. Nella scheda **Sign-in method**, abilita il provider **Email/Password** (il primo interruttore, non serve il link email).

## 4. Attiva Firestore

1. Nel menu laterale vai su **Build → Firestore Database**.
2. Clicca **"Crea database"**.
3. Scegli **"Avvia in modalità di produzione"** (le regole di sicurezza personalizzate le mettiamo subito dopo).
4. Scegli la region più vicina a te (es. `eur3 (europe-west)`).

## 5. Applica le regole di sicurezza

1. Sempre in Firestore, vai sulla scheda **Regole**.
2. Cancella il contenuto e incolla quello del file `firestore.rules` che ti ho generato.
3. Clicca **Pubblica**.

Queste regole garantiscono che ogni utente possa leggere/scrivere **solo i propri dati** — nessun altro può leggere gli account degli altri (a differenza del sistema precedente con jsonblob).

## 6. Carica i file su GitHub Pages

Carica questi file nel repository (sostituendo quelli vecchi), mantenendo la stessa struttura:

- `index.html` (aggiornato)
- `app.js` (aggiornato)
- `firebase-config.js` (nuovo — con le tue chiavi)
- `account-drawer.css` (nuovo)
- `firestore.rules` (solo di riferimento, non serve caricarlo su GitHub Pages, ma tienilo per quando modificherai le regole in futuro)
- `styles.css` (**non toccato**, resta quello che avevi già)
- la cartella `assets/` (**non toccata**)

## 7. Testa

1. Apri il sito, fai il login con un username/password nuovo → si crea un account.
2. Apri lo stesso sito da un altro dispositivo (o browser in incognito) e fai login con le stesse credenziali → dovresti vedere lo stesso mazzo, le stesse monete e lo stesso avatar.
3. Prova il menu account: clicca l'icona rotonda in alto per aprire il menu a scomparsa, prova a cambiare avatar, username, password.

## Note importanti

- **Username**: internamente vengono trasformati in una email "finta" (es. `luca` diventa `luca@beastpocket.local`) perché Firebase Authentication richiede un formato email. Questo è invisibile all'utente, che vede e usa solo lo username.
- **Password dimenticata**: al momento non c'è un flusso di "password dimenticata" (richiederebbe l'invio di vere email). Se ti serve, posso aggiungerlo in un secondo momento — richiede di usare email vere invece che finte.
- **Piano gratuito**: Firebase Authentication e Firestore hanno un piano gratuito (Spark) molto generoso, più che sufficiente per iniziare. Se il gioco cresce molto, puoi controllare l'utilizzo dalla Console.
