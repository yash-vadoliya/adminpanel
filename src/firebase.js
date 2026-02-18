
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // apiKey: "AIzaSyBJblSSf02f7zpf43RWDW0g3jkWJAvXQes",
  apiKey: "AIzaSyA7r7PZ3HqOVb6Sf9ATJBqFcBwEWn9PAw8",
  authDomain: "busbooking-2598b.firebaseapp.com",
  projectId: "busbooking-2598b",
  storageBucket: "busbooking-2598b.firebasestorage.app",
  messagingSenderId: "258401127082",
  appId: "1:258401127082:web:5029eecae62fe3c4701ed3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

