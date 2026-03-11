import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyDjAthALRESYQ9jaLekx4qhehx7KpuRJtI",
  authDomain: "schat-a8064.firebaseapp.com",
  databaseURL: "https://schat-a8064-default-rtdb.firebaseio.com",
  projectId: "schat-a8064",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);