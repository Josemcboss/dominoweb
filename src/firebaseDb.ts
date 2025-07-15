import { app } from "./firebaseConfig";
import { getFirestore } from "firebase/firestore";

// Obtén la instancia de Firestore
export const db = getFirestore(app);

// Ejemplo de función para obtener datos de una colección
// (puedes borrar esto si no lo necesitas)
import { collection, getDocs } from "firebase/firestore";

export async function getCollectionData(collectionName: string) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
