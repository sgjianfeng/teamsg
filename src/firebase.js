// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyY2Ol3pj7ZVHnvuiTucIuk2TUNdGWgTs",
  authDomain: "team-node.firebaseapp.com",
  databaseURL: "https://team-node-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "team-node",
  storageBucket: "team-node.firebasestorage.app",
  messagingSenderId: "224071312379",
  appId: "1:224071312379:web:43bda9447127fab6b8215e",
  measurementId: "G-0F48W67N8S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
