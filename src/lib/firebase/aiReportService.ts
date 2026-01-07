import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { FirestoreAIReport } from '@/types/firebase'

// Get reference to user's AI reports collection
const getUserReportsRef = (userId: string) => collection(db, 'users', userId, 'aiReports')

// Save an AI report
export async function saveAIReport(
  userId: string,
  report: {
    spectrumId?: string
    spectrumIds?: string[]
    interpretation: string
    prompt: string
    model?: string
    isComparison?: boolean
  }
): Promise<string> {
  const reportData = {
    spectrumId: report.spectrumId || '',
    spectrumIds: report.spectrumIds || [],
    interpretation: report.interpretation,
    prompt: report.prompt,
    model: report.model || 'gemini-flash',
    isComparison: report.isComparison || false,
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(getUserReportsRef(userId), reportData)
  return docRef.id
}

// Get reports for a specific spectrum
export async function getReportsForSpectrum(
  userId: string,
  spectrumId: string
): Promise<Array<{ id: string; data: FirestoreAIReport & { createdAt: Date } }>> {
  const q = query(
    getUserReportsRef(userId),
    where('spectrumId', '==', spectrumId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    data: {
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as FirestoreAIReport & { createdAt: Date },
  }))
}

// Get all reports (most recent first)
export async function getAllReports(
  userId: string,
  maxItems: number = 50
): Promise<Array<{ id: string; data: FirestoreAIReport & { createdAt: Date } }>> {
  const q = query(
    getUserReportsRef(userId),
    orderBy('createdAt', 'desc'),
    limit(maxItems)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    data: {
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as FirestoreAIReport & { createdAt: Date },
  }))
}

// Get comparison reports
export async function getComparisonReports(
  userId: string
): Promise<Array<{ id: string; data: FirestoreAIReport & { createdAt: Date } }>> {
  const q = query(
    getUserReportsRef(userId),
    where('isComparison', '==', true),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    data: {
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as FirestoreAIReport & { createdAt: Date },
  }))
}
