import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const MediaContext = createContext(null);
const COLLECTION = "gallery";

export function MediaProvider({ children }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFirebase, setUsingFirebase] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy("uploadedAt", "desc"),
      );
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            uploadedAt:
              d.data().uploadedAt?.toDate?.()?.toISOString?.() ??
              new Date().toISOString(),
          }));
          setMedia(docs);
          setUsingFirebase(true);
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore unavailable.", err.message);
          setMedia([]);
          setLoading(false);
        },
      );
    } catch (err) {
      console.warn("Firebase not configured.", err.message);
      setMedia([]);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const homeMedia = [...media]
    .filter((m) => m.homeGallery === true)
    .sort((a, b) => (a.homeSlot ?? 99) - (b.homeSlot ?? 99))
    .slice(0, 6);

  const generalMedia = media.filter((m) => !m.homeGallery);

  const addMedia = useCallback(
    async (item) => {
      if (usingFirebase) {
        try {
          await addDoc(collection(db, COLLECTION), {
            ...item,
            uploadedAt: serverTimestamp(),
          });
          return;
        } catch (err) {
          console.warn("Firestore addDoc failed, falling back to local", err);
        }
      }
      const newItem = {
        ...item,
        id: Date.now().toString(),
        uploadedAt: new Date().toISOString(),
      };
      setMedia((prev) => [newItem, ...prev]);
    },
    [usingFirebase],
  );

  const deleteMedia = useCallback(
    async (id) => {
      // Optimistic update — remove immediately so UI reflects change without refresh
      setMedia((prev) => prev.filter((m) => m.id !== id));
      if (usingFirebase) {
        try {
          await deleteDoc(doc(db, COLLECTION, id));
        } catch (err) {
          console.warn("Firestore deleteDoc failed", err);
        }
      }
    },
    [usingFirebase],
  );

  const updateMedia = useCallback(
    async (id, updates) => {
      // Optimistic update
      setMedia((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      );
      if (usingFirebase) {
        try {
          await updateDoc(doc(db, COLLECTION, id), updates);
        } catch (err) {
          console.warn("Firestore updateDoc failed", err);
        }
      }
    },
    [usingFirebase],
  );

  return (
    <MediaContext.Provider
      value={{
        media,
        homeMedia,
        generalMedia,
        loading,
        usingFirebase,
        addMedia,
        deleteMedia,
        updateMedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export const useMedia = () => useContext(MediaContext);
