/**
 * Rate-of-Rise Firebase Service
 * Cloud storage for pressure rise test data
 */

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
import { db } from '@/lib/firebase/config'
import type { RateOfRiseData, RateOfRiseAnalysis } from '@/types/rateOfRise'
import type { FirestoreRoRTest, FirestoreRoRFullData, CloudRoRTestMeta } from '@/types/firebase'

// Get reference to user's RoR tests collection
const getUserRoRTestsRef = (userId: string) => collection(db, 'users', userId, 'rorTests')

// Save a Rate-of-Rise test to Firestore
export async function saveRoRTest(
  userId: string,
  data: RateOfRiseData,
  analysis: RateOfRiseAnalysis,
  options?: { tags?: string[]; notes?: string }
): Promise<string> {
  // Main document with summary data (for list queries)
  const testData: Omit<FirestoreRoRTest, 'uploadedAt'> & { uploadedAt: ReturnType<typeof serverTimestamp> } = {
    filename: data.metadata.filename,
    uploadedAt: serverTimestamp(),
    measurementDate: Timestamp.fromDate(data.metadata.recordingStart),
    metadata: {
      manufacturer: data.metadata.manufacturer,
      device: data.metadata.device,
      serialNumber: data.metadata.serialNumber,
      sensor: data.metadata.sensor1Type,
      measurementInterval: data.metadata.measurementInterval,
      duration: data.duration,
    },
    analysisSnapshot: {
      dpdt: analysis.dpdt,
      leakRate: analysis.leakRate?.Q ?? null,
      leakRateFormatted: analysis.leakRate?.QFormatted ?? null,
      volume: analysis.leakRate?.volume ?? null,
      classificationType: analysis.classification.type,
      classificationConfidence: analysis.classification.confidence,
      limitPassed: analysis.limitCheck?.passed ?? null,
      limitValue: analysis.limitCheck?.limit ?? null,
      limitSource: analysis.limitCheck?.limitSource ?? null,
    },
    tags: options?.tags || [],
    notes: options?.notes || '',
    isArchived: false,
  }

  // Add main document
  const docRef = await addDoc(getUserRoRTestsRef(userId), testData)

  // Add full data to subcollection
  const fullData: FirestoreRoRFullData = {
    dataPoints: data.dataPoints,
    classification: analysis.classification,
    linearFit: analysis.linearFit,
    baselinePhase: analysis.baselinePhase,
    risePhase: analysis.risePhase,
  }

  await addDoc(collection(db, 'users', userId, 'rorTests', docRef.id, 'fullData'), fullData)

  return docRef.id
}

// Get a single RoR test with full data
export async function getRoRTest(
  userId: string,
  testId: string
): Promise<{ data: RateOfRiseData; analysis: RateOfRiseAnalysis } | null> {
  const docRef = doc(db, 'users', userId, 'rorTests', testId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  const docData = docSnap.data() as FirestoreRoRTest

  // Get full data from subcollection
  const fullDataSnap = await getDocs(
    collection(db, 'users', userId, 'rorTests', testId, 'fullData')
  )
  const fullData = fullDataSnap.docs[0]?.data() as FirestoreRoRFullData | undefined

  if (!fullData) return null

  // Reconstruct dataPoints with proper Date objects
  const dataPoints = fullData.dataPoints.map(dp => ({
    ...dp,
    timestamp: new Date(dp.timestamp),
  }))

  // Reconstruct RateOfRiseData
  const reconstructedData: RateOfRiseData = {
    metadata: {
      manufacturer: docData.metadata.manufacturer,
      device: docData.metadata.device,
      articleNumber: '',
      serialNumber: docData.metadata.serialNumber,
      firmwareVersion: '',
      filename: docData.filename,
      recordingStart: docData.measurementDate?.toDate() || new Date(),
      measurementInterval: docData.metadata.measurementInterval,
      sensor1Type: docData.metadata.sensor as RateOfRiseData['metadata']['sensor1Type'],
      sensor2Type: null,
    },
    dataPoints,
    duration: docData.metadata.duration,
    minPressure: Math.min(...dataPoints.map(dp => dp.pressure1).filter(p => p > 0)),
    maxPressure: Math.max(...dataPoints.map(dp => dp.pressure1)),
    pointCount: dataPoints.length,
  }

  // Calculate leak rate margin if we have the limit check info
  const leakRateMargin = docData.analysisSnapshot.limitValue && docData.analysisSnapshot.leakRate
    ? docData.analysisSnapshot.leakRate / docData.analysisSnapshot.limitValue
    : 0

  // Reconstruct RateOfRiseAnalysis
  const reconstructedAnalysis: RateOfRiseAnalysis = {
    dpdt: docData.analysisSnapshot.dpdt,
    dpdtFormatted: `${docData.analysisSnapshot.dpdt.toExponential(2)} mbar/s`,
    transitionIndex: fullData.baselinePhase.endIndex,
    linearFit: {
      ...fullData.linearFit,
      residualStdDev: 0,
      dataPoints: fullData.risePhase.endIndex - fullData.risePhase.startIndex + 1,
    },
    baselinePhase: {
      ...fullData.baselinePhase,
      stdDev: 0,
      startPressure: dataPoints[fullData.baselinePhase.startIndex]?.pressure1 || 0,
      endPressure: dataPoints[fullData.baselinePhase.endIndex]?.pressure1 || 0,
      duration: dataPoints[fullData.baselinePhase.endIndex]?.relativeTimeS - dataPoints[fullData.baselinePhase.startIndex]?.relativeTimeS || 0,
    },
    risePhase: {
      ...fullData.risePhase,
      startPressure: dataPoints[fullData.risePhase.startIndex]?.pressure1 || 0,
      endPressure: dataPoints[fullData.risePhase.endIndex]?.pressure1 || 0,
      duration: dataPoints[fullData.risePhase.endIndex]?.relativeTimeS - dataPoints[fullData.risePhase.startIndex]?.relativeTimeS || 0,
    },
    classification: fullData.classification,
    leakRate: docData.analysisSnapshot.leakRate !== null
      ? {
          volume: docData.analysisSnapshot.volume!,
          Q: docData.analysisSnapshot.leakRate,
          QFormatted: docData.analysisSnapshot.leakRateFormatted!,
          Q_Pa: docData.analysisSnapshot.leakRate * 0.1,
          Q_PaFormatted: `${(docData.analysisSnapshot.leakRate * 0.1).toExponential(2)} Pa·m³/s`,
          equivalentHeLeak: docData.analysisSnapshot.leakRate * 2.69,
        }
      : undefined,
    limitCheck: docData.analysisSnapshot.limitPassed !== null
      ? {
          limit: docData.analysisSnapshot.limitValue!,
          limitSource: docData.analysisSnapshot.limitSource!,
          passed: docData.analysisSnapshot.limitPassed,
          margin: leakRateMargin,
        }
      : undefined,
  }

  return { data: reconstructedData, analysis: reconstructedAnalysis }
}

// Get list of RoR tests (metadata only, for archive view)
export async function getRoRTestsList(
  userId: string,
  options?: { archived?: boolean; maxItems?: number; tags?: string[] }
): Promise<CloudRoRTestMeta[]> {
  // Simple query without compound index requirement
  const q = query(
    getUserRoRTestsRef(userId),
    orderBy('uploadedAt', 'desc')
  )

  const snapshot = await getDocs(q)

  // Filter by archived status client-side
  const archivedFilter = options?.archived ?? false
  const filteredDocs = snapshot.docs.filter((docSnap) => {
    const docData = docSnap.data() as FirestoreRoRTest
    return docData.isArchived === archivedFilter
  })

  return filteredDocs.map((docSnap) => {
    const docData = docSnap.data() as FirestoreRoRTest
    return {
      id: docSnap.id,
      filename: docData.filename,
      uploadedAt: docData.uploadedAt.toDate(),
      measurementDate: docData.measurementDate?.toDate() || null,
      tags: docData.tags,
      notes: docData.notes,
      isArchived: docData.isArchived,
      metadata: {
        device: docData.metadata.device,
        serialNumber: docData.metadata.serialNumber,
        sensor: docData.metadata.sensor,
        duration: docData.metadata.duration,
      },
      analysisSnapshot: {
        dpdt: docData.analysisSnapshot.dpdt,
        leakRate: docData.analysisSnapshot.leakRate,
        leakRateFormatted: docData.analysisSnapshot.leakRateFormatted,
        classificationType: docData.analysisSnapshot.classificationType,
        classificationConfidence: docData.analysisSnapshot.classificationConfidence,
        limitPassed: docData.analysisSnapshot.limitPassed,
        limitSource: docData.analysisSnapshot.limitSource,
      },
    }
  })
}

// Update RoR test notes and tags
export async function updateRoRTestMeta(
  userId: string,
  testId: string,
  updates: { notes?: string; tags?: string[] }
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'rorTests', testId)
  await updateDoc(docRef, updates)
}

// Archive/unarchive RoR test
export async function archiveRoRTest(
  userId: string,
  testId: string,
  archive: boolean = true
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'rorTests', testId)
  await updateDoc(docRef, { isArchived: archive })
}

// Delete RoR test and all related data
export async function deleteRoRTest(userId: string, testId: string): Promise<void> {
  // Delete fullData subcollection documents
  const fullDataSnap = await getDocs(
    collection(db, 'users', userId, 'rorTests', testId, 'fullData')
  )
  for (const docSnap of fullDataSnap.docs) {
    await deleteDoc(docSnap.ref)
  }

  // Delete main document
  await deleteDoc(doc(db, 'users', userId, 'rorTests', testId))
}
