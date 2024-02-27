// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEaBNFgOml9ucJGqEb5XcFvqcREswOxv8",
  authDomain: "med-quiz-353f5.firebaseapp.com",
  databaseURL: "https://med-quiz-353f5-default-rtdb.firebaseio.com",
  projectId: "med-quiz-353f5",
  storageBucket: "med-quiz-353f5.appspot.com",
  messagingSenderId: "826064878933",
  appId: "1:826064878933:web:fcd7b216603a9bf1e4c3dc",
  measurementId: "G-1BZ44ZG8FK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);