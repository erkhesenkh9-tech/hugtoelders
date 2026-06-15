// Copy this file to firebase-config.js and fill in your Firebase project values.
// Firebase Console → Project settings → Your apps → Web app → SDK setup and configuration
window.firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

// Emails allowed to post newsletters (must match Firestore rules in firestore.rules)
window.adminEmails = [
  'hugstoelders@gmail.com'
];
