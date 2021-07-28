import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Firebase from 'firebase'

var firebaseConfig = {
  apiKey: "AIzaSyDz72CQ8LqKHeAwPihvAkcYXzhbMCiEiRU",
  authDomain: "solarladderinventory.firebaseapp.com",
  projectId: "solarladderinventory",
  storageBucket: "solarladderinventory.appspot.com",
  messagingSenderId: "383357036879",
  appId: "1:383357036879:web:7bd1dfb3c7e47826b23d3a",
  measurementId: "G-TD83R959E0"
};

Firebase.initializeApp(firebaseConfig)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)