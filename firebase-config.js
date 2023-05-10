// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCn-dqVI8j6ub5HN5aegixR5zKOgU7JQGU",
    authDomain: "med-quiz-9b266.firebaseapp.com",
    databaseURL: "https://med-quiz-9b266-default-rtdb.firebaseio.com",
    projectId: "med-quiz-9b266",
    storageBucket: "med-quiz-9b266.appspot.com",
    messagingSenderId: "2474468159",
    appId: "1:2474468159:web:d9895ad541c9e6e23ee98a",
    measurementId: "G-R0Z1JDDHZ0"
  };
  
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Add this line to get a reference to the Realtime Database
    const database = firebase.database();
    console.log('Firebase initialized');
    window.firebaseLoadedEvent = new Event('firebase_loaded');
    document.dispatchEvent(window.firebaseLoadedEvent);