import firebase from 'firebase';


const firebaseConfig = {
  apiKey: "AIzaSyAtjhLaXh__6WriEJkY84KczNZfixWv_UQ",
  authDomain: "instory-project-48c2c.firebaseapp.com",
  projectId: "instory-project-48c2c",
  storageBucket: "instory-project-48c2c.appspot.com",
  messagingSenderId: "460252711896",
  appId: "1:460252711896:web:d0b2a2745d3ef1985f80ad",
  measurementId: "G-XCYMDH0E5V"
};


const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export {db, auth, storage};