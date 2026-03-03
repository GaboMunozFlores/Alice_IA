// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js"
// en deshu"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCq2lQnID4SSkFIKh_ja6paB4aHuq4KU0M",
  authDomain: "proyectercerparcial.firebaseapp.com",
  databaseURL: "https://proyectercerparcial-default-rtdb.firebaseio.com",
  projectId: "proyectercerparcial",
  storageBucket: "proyectercerparcial.appspot.com",
  messagingSenderId: "39792129165",
  appId: "1:39792129165:web:631ce9e0c7fb657a135ec4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

