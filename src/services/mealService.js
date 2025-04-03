import { 
    collection, 
    addDoc, 
    serverTimestamp 
  } from 'firebase/firestore'
  import { db } from '@/firebase'
  import { getAuth } from 'firebase/auth'
  
  export async function saveMealEntry(mealData) {
    const auth = getAuth()
    const user = auth.currentUser
  
    if (!user) {
      throw new Error('User not authenticated')
    }
  
    try {
      const mealCollection = collection(db, 'meals')
      
      return await addDoc(mealCollection, {
        userId: user.uid,
        ...mealData,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error saving meal:', error)
      throw error
    }
  }
  
  export async function getUserMeals(limit = 10) {
    const auth = getAuth()
    const user = auth.currentUser
  
    const q = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limit)
    )
  
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }