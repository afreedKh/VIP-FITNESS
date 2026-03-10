import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// Default seed for home gallery (6 items, homeGallery: true)
export const DEFAULT_HOME_MEDIA = [
  { id: 'default-1', type: 'photo', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200', thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200', title: 'Gym Floor',        category: 'facility', homeGallery: true, homeSlot: 0, uploadedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'default-2', type: 'photo', url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800',  thumbnailUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800',  title: 'Strength Training', category: 'training',  homeGallery: true, homeSlot: 1, uploadedAt: '2024-01-02T00:00:00.000Z' },
  { id: 'default-3', type: 'photo', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',  thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',  title: 'Cardio Zone',      category: 'facility', homeGallery: true, homeSlot: 2, uploadedAt: '2024-01-03T00:00:00.000Z' },
  { id: 'default-4', type: 'photo', url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&q=80&w=800',  thumbnailUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&q=80&w=800',  title: 'Weight Training',  category: 'training',  homeGallery: true, homeSlot: 3, uploadedAt: '2024-01-04T00:00:00.000Z' },
  { id: 'default-5', type: 'photo', url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=800',  thumbnailUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=800',  title: 'Personal Training', category: 'training', homeGallery: true, homeSlot: 4, uploadedAt: '2024-01-05T00:00:00.000Z' },
  { id: 'default-6', type: 'photo', url: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&q=80&w=1200', thumbnailUrl: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&q=80&w=1200', title: 'Equipment Zone',    category: 'facility', homeGallery: true, homeSlot: 5, uploadedAt: '2024-01-06T00:00:00.000Z' },
]

// Default seed for general gallery (homeGallery: false)
export const DEFAULT_GENERAL_MEDIA = [
  { id: 'default-7', type: 'photo', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200', thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200', title: 'Premium Interior', category: 'facility', homeGallery: false, uploadedAt: '2024-01-07T00:00:00.000Z' },
]

const DEFAULT_MEDIA = [...DEFAULT_HOME_MEDIA, ...DEFAULT_GENERAL_MEDIA]

const MediaContext = createContext(null)
const COLLECTION = 'gallery'

export function MediaProvider({ children }) {
  const [media, setMedia]               = useState(DEFAULT_MEDIA)
  const [loading, setLoading]           = useState(true)
  const [usingFirebase, setUsingFirebase] = useState(false)

  // Subscribe to Firestore
  useEffect(() => {
    let unsubscribe = () => {}
    try {
      const q = query(collection(db, COLLECTION), orderBy('uploadedAt', 'desc'))
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            uploadedAt: d.data().uploadedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          }))
          if (docs.length > 0) {
            setMedia(docs)
          }
          setUsingFirebase(true)
          setLoading(false)
        },
        (err) => {
          console.warn('Firestore unavailable – using local defaults.', err.message)
          setLoading(false)
        }
      )
    } catch (err) {
      console.warn('Firebase not configured – using local defaults.', err.message)
      setLoading(false)
    }
    return () => unsubscribe()
  }, [])

  // home gallery: items flagged homeGallery:true, sorted by homeSlot
  const homeMedia = [...media]
    .filter(m => m.homeGallery === true)
    .sort((a, b) => (a.homeSlot ?? 99) - (b.homeSlot ?? 99))
    .slice(0, 6)

  // general gallery: items flagged homeGallery:false (or undefined for back-compat)
  const generalMedia = media.filter(m => !m.homeGallery)

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addMedia = useCallback(async (item) => {
    const newItem = { ...item, uploadedAt: new Date().toISOString() }
    if (usingFirebase) {
      try {
        await addDoc(collection(db, COLLECTION), { ...item, uploadedAt: serverTimestamp() })
        return
      } catch (err) {
        console.warn('Firestore addDoc failed, falling back to local', err)
      }
    }
    setMedia(prev => [{ ...newItem, id: Date.now().toString() }, ...prev])
  }, [usingFirebase])

  const deleteMedia = useCallback(async (id) => {
    if (usingFirebase && !id.startsWith('default-')) {
      try { await deleteDoc(doc(db, COLLECTION, id)); return }
      catch (err) { console.warn('Firestore deleteDoc failed', err) }
    }
    setMedia(prev => prev.filter(m => m.id !== id))
  }, [usingFirebase])

  const updateMedia = useCallback(async (id, updates) => {
    if (usingFirebase && !id.startsWith('default-')) {
      try { await updateDoc(doc(db, COLLECTION, id), updates); return }
      catch (err) { console.warn('Firestore updateDoc failed', err) }
    }
    setMedia(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }, [usingFirebase])

  return (
    <MediaContext.Provider value={{
      media, homeMedia, generalMedia,
      loading, usingFirebase,
      addMedia, deleteMedia, updateMedia,
    }}>
      {children}
    </MediaContext.Provider>
  )
}

export const useMedia = () => useContext(MediaContext)
