
import { initializeApp } from "https://www.gstatic.com/firebasejs/14.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/14.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/14.23.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/14.23.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOYAJEhYKBno3VCBemH-_eWnXQ0P5dzDo",
  authDomain: "alice-app-55273.firebaseapp.com",
  databaseURL: "https://alice-app-55273-default-rtdb.firebaseio.com",
  projectId: "alice-app-55273",
  storageBucket: "alice-app-55273.firebasestorage.app",
  messagingSenderId: "662261467287",
  appId: "1:662261467287:web:9b48a3fe78a0317b36c1d2",
  measurementId: "G-CR1HXT1P1H"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
