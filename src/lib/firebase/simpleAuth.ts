import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'
import type { FirestoreUser, AppUser } from '@/types/firebase'

const USER_SESSION_KEY = 'rga-user-session'

// Generate SHA-256 hash for user identification
async function hashUserCredentials(name: string, pin: string): Promise<string> {
  const input = `${name.toLowerCase().trim()}:${pin}`
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Generate hash of just the PIN for storage verification
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Check if user exists and PIN matches
export async function loginUser(
  name: string,
  pin: string
): Promise<AppUser | null> {
  const userId = await hashUserCredentials(name, pin)
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const userData = userSnap.data() as FirestoreUser
    const inputPinHash = await hashPin(pin)

    // Verify PIN matches
    if (userData.pinHash === inputPinHash) {
      const user: AppUser = {
        id: userId,
        name: userData.name,
      }

      // Save session to localStorage
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user))

      return user
    }
  }

  return null
}

// Create new user or login if exists
export async function createOrLoginUser(
  name: string,
  pin: string
): Promise<{ user: AppUser; isNew: boolean }> {
  const userId = await hashUserCredentials(name, pin)
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)

  const pinHash = await hashPin(pin)

  if (userSnap.exists()) {
    // User exists, verify PIN
    const userData = userSnap.data() as FirestoreUser
    if (userData.pinHash === pinHash) {
      const user: AppUser = {
        id: userId,
        name: userData.name,
      }
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user))
      return { user, isNew: false }
    } else {
      throw new Error('PIN_MISMATCH')
    }
  }

  // Create new user
  const newUserData: Omit<FirestoreUser, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    name: name.trim(),
    pinHash,
    createdAt: serverTimestamp(),
    settings: {
      theme: 'light',
      language: 'de',
      chartOptions: {
        logScale: true,
        normalizationMass: 2,
      },
    },
  }

  await setDoc(userRef, newUserData)

  const user: AppUser = {
    id: userId,
    name: name.trim(),
  }

  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user))

  return { user, isNew: true }
}

// Get current user from localStorage
export function getCurrentUser(): AppUser | null {
  const sessionData = localStorage.getItem(USER_SESSION_KEY)
  if (sessionData) {
    try {
      return JSON.parse(sessionData) as AppUser
    } catch {
      return null
    }
  }
  return null
}

// Logout user
export function logout(): void {
  localStorage.removeItem(USER_SESSION_KEY)
}

// Validate PIN format (4-6 digits)
export function validatePin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin)
}

// Validate name (at least 2 characters, letters only)
export function validateName(name: string): boolean {
  return /^[a-zA-ZäöüÄÖÜß\s-]{2,}$/.test(name.trim())
}
