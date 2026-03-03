
import { initializeApp } from "https://www.gstatic.com/firebasejs/14.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/14.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/14.23.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/14.23.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCq2lQnID4SSkFIKh_ja6paB4aHuq4KU0M",
  authDomain: "proyectercerparcial.firebaseapp.com",
  databaseURL: "https://proyectercerparcial-default-rtdb.firebaseio.com",
  projectId: "proyectercerparcial",
  storageBucket: "proyectercerparcial.appspot.com",
  messagingSenderId: "39792129165",
  appId: "1:39792129165:web:631ce9e0c7fb657a135ec4"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
