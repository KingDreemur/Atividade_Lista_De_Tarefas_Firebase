import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBWlBI0ppM4TCQlv4JI6_7wx8k7PaRAb9I",
    authDomain: "persistencia-2222b.firebaseapp.com",
    projectId: "persistencia-2222b",
    storageBucket: "persistencia-2222b.appspot.com",
    messagingSenderId: "1008848138519",
    appId: "1:1008848138519:web:8efa70c80f6213d41ec752"
}

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { db, auth};