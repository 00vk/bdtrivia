import { firebaseConfig } from './config.js';

firebase.initializeApp(firebaseConfig);
export const db = firebase.database();
