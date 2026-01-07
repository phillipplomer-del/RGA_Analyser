import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { MeasurementFile } from '@/types/rga'
import type { FirestoreSpectrum, FirestoreSpectrumFullData, CloudSpectrumMeta } from '@/types/firebase'

// Get reference to user's spectra collection
const getUserSpectraRef = (userId: string) => collection(db, 'users', userId, 'spectra')

// Save a spectrum to Firestore
export async function saveSpectrum(
  userId: string,
  file: MeasurementFile,
  options?: { tags?: string[]; notes?: string }
): Promise<string> {
  const analysis = file.analysisResult

  // Main document with summary data (for list queries)
  // Note: Firestore doesn't accept undefined values, so we use null or empty strings
  const spectrumData: Omit<FirestoreSpectrum, 'uploadedAt'> & { uploadedAt: ReturnType<typeof serverTimestamp> } = {
    filename: file.filename,
    uploadedAt: serverTimestamp(),
    measurementDate: analysis.metadata.startTime
      ? Timestamp.fromDate(analysis.metadata.startTime)
      : null,
    metadata: {
      sourceFile: analysis.metadata.sourceFile || '',
      taskName: analysis.metadata.taskName || '',
      chamberName: analysis.metadata.chamberName || '',
      pressure: analysis.metadata.pressure ?? undefined,
      firstMass: analysis.metadata.firstMass ?? 0,
      scanWidth: analysis.metadata.scanWidth ?? 0,
    },
    analysisSnapshot: {
      totalPressure: analysis.totalPressure ?? 0,
      dominantGases: analysis.dominantGases?.slice(0, 5) || [],
      peakCount: analysis.peaks?.length || 0,
      qualityChecksPassed: analysis.qualityChecks?.every((c) => c.passed) ?? false,
      diagnosisSummary: analysis.diagnosisSummary || { overallStatus: 'clean', systemState: 'unknown', criticalCount: 0, warningCount: 0, infoCount: 0 },
    },
    tags: options?.tags || [],
    notes: options?.notes || '',
    isArchived: false,
  }

  // Add main document
  const docRef = await addDoc(getUserSpectraRef(userId), spectrumData)

  // Add full data to subcollection
  const fullData: FirestoreSpectrumFullData = {
    normalizedData: analysis.normalizedData,
    peaks: analysis.peaks,
    limitChecks: analysis.limitChecks,
    qualityChecks: analysis.qualityChecks,
    diagnostics: analysis.diagnostics || [],
  }

  await addDoc(collection(db, 'users', userId, 'spectra', docRef.id, 'fullData'), fullData)

  return docRef.id
}

// Get a single spectrum with full data
export async function getSpectrum(
  userId: string,
  spectrumId: string
): Promise<MeasurementFile | null> {
  const docRef = doc(db, 'users', userId, 'spectra', spectrumId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  const data = docSnap.data() as FirestoreSpectrum

  // Get full data from subcollection
  const fullDataSnap = await getDocs(
    collection(db, 'users', userId, 'spectra', spectrumId, 'fullData')
  )
  const fullData = fullDataSnap.docs[0]?.data() as FirestoreSpectrumFullData | undefined

  if (!fullData) return null

  // Reconstruct MeasurementFile
  return {
    id: docSnap.id,
    order: 0,
    filename: data.filename,
    uploadedAt: data.uploadedAt.toDate(),
    rawData: {
      metadata: {
        ...data.metadata,
        sourceFile: data.metadata.sourceFile,
        exportTime: null,
        startTime: data.measurementDate?.toDate() || null,
        endTime: null,
        taskName: data.metadata.taskName,
        firstMass: data.metadata.firstMass,
        scanWidth: data.metadata.scanWidth,
      },
      points: [], // Raw points not stored, using normalizedData instead
    },
    analysisResult: {
      metadata: {
        ...data.metadata,
        sourceFile: data.metadata.sourceFile,
        exportTime: null,
        startTime: data.measurementDate?.toDate() || null,
        endTime: null,
        taskName: data.metadata.taskName,
        firstMass: data.metadata.firstMass,
        scanWidth: data.metadata.scanWidth,
      },
      normalizedData: fullData.normalizedData,
      peaks: fullData.peaks,
      limitChecks: fullData.limitChecks,
      qualityChecks: fullData.qualityChecks,
      totalPressure: data.analysisSnapshot.totalPressure,
      dominantGases: data.analysisSnapshot.dominantGases,
      diagnostics: fullData.diagnostics,
      diagnosisSummary: data.analysisSnapshot.diagnosisSummary,
    },
  }
}

// Get list of spectra (metadata only, for archive view)
export async function getSpectraList(
  userId: string,
  options?: { archived?: boolean; maxItems?: number; tags?: string[] }
): Promise<CloudSpectrumMeta[]> {
  // Simple query without compound index requirement
  // We filter and sort client-side to avoid needing a Firestore index
  const q = query(
    getUserSpectraRef(userId),
    orderBy('uploadedAt', 'desc')
  )

  const snapshot = await getDocs(q)

  // Filter by archived status client-side
  const archivedFilter = options?.archived ?? false
  const filteredDocs = snapshot.docs.filter((doc) => {
    const data = doc.data() as FirestoreSpectrum
    return data.isArchived === archivedFilter
  })

  return filteredDocs.map((doc) => {
    const data = doc.data() as FirestoreSpectrum
    return {
      id: doc.id,
      filename: data.filename,
      uploadedAt: data.uploadedAt.toDate(),
      measurementDate: data.measurementDate?.toDate() || null,
      tags: data.tags,
      notes: data.notes,
      isArchived: data.isArchived,
      analysisSnapshot: {
        totalPressure: data.analysisSnapshot.totalPressure,
        dominantGases: data.analysisSnapshot.dominantGases,
        peakCount: data.analysisSnapshot.peakCount,
        qualityChecksPassed: data.analysisSnapshot.qualityChecksPassed,
        overallStatus: data.analysisSnapshot.diagnosisSummary.overallStatus,
      },
    }
  })
}

// Update spectrum notes and tags
export async function updateSpectrumMeta(
  userId: string,
  spectrumId: string,
  updates: { notes?: string; tags?: string[] }
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'spectra', spectrumId)
  await updateDoc(docRef, updates)
}

// Archive/unarchive spectrum
export async function archiveSpectrum(
  userId: string,
  spectrumId: string,
  archive: boolean = true
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'spectra', spectrumId)
  await updateDoc(docRef, { isArchived: archive })
}

// Delete spectrum and all related data
export async function deleteSpectrum(userId: string, spectrumId: string): Promise<void> {
  // Delete fullData subcollection documents
  const fullDataSnap = await getDocs(
    collection(db, 'users', userId, 'spectra', spectrumId, 'fullData')
  )
  for (const docSnap of fullDataSnap.docs) {
    await deleteDoc(docSnap.ref)
  }

  // Delete main document
  await deleteDoc(doc(db, 'users', userId, 'spectra', spectrumId))
}
