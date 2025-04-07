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
  
    console.log('Saving Meal - Full Authentication Details:', {
      userExists: !!user,
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      isAnonymous: user?.isAnonymous,
      emailVerified: user?.emailVerified
    })
  
    if (!user) {
      console.error('Attempted to save meal with no authenticated user')
      throw new Error('User not authenticated')
    }
  
    try {
      const mealCollection = collection(db, 'meals')
      
      const mealEntry = {
        userId: user.uid,  // Explicitly set userId
        ...mealData,
        timestamp: serverTimestamp()
      }
  
      console.log('Meal Entry to Save:', mealEntry)
  
      // Get the current user's ID token to verify authentication
      const idToken = await user.getIdToken()
      console.log('ID Token Retrieved:', !!idToken)
  
      return await addDoc(mealCollection, mealEntry)
    } catch (error) {
      console.error('Detailed Meal Saving Error:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      })
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