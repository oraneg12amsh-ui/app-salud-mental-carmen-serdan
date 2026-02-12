import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDT9M_s82TJrxwFMMFFt_M7GrQdVUFXZ2c",
  authDomain: "plataforma-carmen-serdan.firebaseapp.com",
  projectId: "plataforma-carmen-serdan",
  storageBucket: "plataforma-carmen-serdan.firebasestorage.app",
  messagingSenderId: "124079826705",
  appId: "1:124079826705:web:5e2abd11506ae24accceb0",
  measurementId: "G-VCYFS0K3BB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);