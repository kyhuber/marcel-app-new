import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  DocumentReference
} from 'firebase/firestore'
import { db } from '@/firebase'
import { getAuth } from 'firebase/auth'

interface MealData {
  userId: string;
  [key: string]: any; // For other meal properties
}

interface MealEntry extends MealData {
  id: string;
  timestamp: any; // Firestore Timestamp
}

export async function saveMealEntry(mealData: MealData): Promise<DocumentReference> {
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
      ...mealData,
      userId: user.uid,
      timestamp: serverTimestamp()
    }

    console.log('Meal Entry to Save:', mealEntry)

    const idToken = await user.getIdToken()
    console.log('ID Token Retrieved:', !!idToken)

    return await addDoc(mealCollection, mealEntry)
  } catch (error) {
    console.error('Detailed Meal Saving Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error ? (error as any).code : undefined,
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

export async function getUserMeals(limit: number = 10): Promise<MealEntry[]> {
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) {
    throw new Error('User not authenticated')
  }

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
  })) as MealEntry[]
}