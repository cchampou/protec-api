import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import {messaging} from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

const app = initializeApp({
  credential: credential.cert('./firebase-key.json'),
}, 'alert');

const TOKEN = 'fXJwZUWtRBaPke9_Q3h8Ac:APA91bEy_fh7WcpZnhEQgW0C-b2cxXshiZEoB8Qr7CDYciCYRzhFwfzMBRqy613h4wZrDPffRr3E0CU2KY5Xx71c-KOWOQg_kZMeQCavuhKbU4z6nb94mnbPuG-q1I0QyZI2USJuQVbp';

getMessaging(app).sendToDevice(TOKEN, {
  notification: {
    title: 'Déclenchement PC',
    body: 'Ceci est un test système',
  }
}).then((response) => {
  console.log(response);
}).catch((error) => {
  console.log(error);
});
