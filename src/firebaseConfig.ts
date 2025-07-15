// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPV8GysK-7mbqb0EK8Oev-bvy2y7o3kBQ",
  authDomain: "domino-online-edfff.firebaseapp.com",
  projectId: "domino-online-edfff",
  storageBucket: "domino-online-edfff.appspot.com",
  messagingSenderId: "609983684289",
  appId: "1:609983684289:web:c221f30b4b2e5c898d3e40",
  measurementId: "G-DTFRNVKZC5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };