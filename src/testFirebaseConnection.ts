// Prueba de conexión a Firebase Realtime Database
import { db } from './firebaseClient';

// Lee la raíz de la base de datos y muestra el resultado en consola
export function testFirebaseConnection() {
  db.ref('/').once('value')
    .then(snapshot => {
      console.log('Datos de Firebase:', snapshot.val());
    })
    .catch(error => {
      console.error('Error al conectar con Firebase:', error);
    });
}
