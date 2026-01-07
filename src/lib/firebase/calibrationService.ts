import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { DeviceCalibration } from '@/types/calibration'

// Firestore-Version der DeviceCalibration
interface FirestoreDeviceCalibration {
  deviceId: string
  timestamp: Timestamp
  baseSensitivity: number
  detectorType: 'faraday' | 'sem'
  customRSF?: Record<string, number>
  semVoltageAtCalibration?: number
  measurements: {
    gas: string
    referencePressure: number
    measuredCurrent: number
    mass: number
  }[]
  updatedAt: ReturnType<typeof serverTimestamp>
}

// Get reference to user's calibrations collection
const getUserCalibrationsRef = (userId: string) => collection(db, 'users', userId, 'calibrations')

/**
 * Speichert oder aktualisiert eine Geräte-Kalibrierung in Firestore
 */
export async function saveDeviceCalibration(
  userId: string,
  calibration: DeviceCalibration
): Promise<void> {
  const docRef = doc(getUserCalibrationsRef(userId), calibration.deviceId)

  const firestoreData: FirestoreDeviceCalibration = {
    deviceId: calibration.deviceId,
    timestamp: Timestamp.fromDate(calibration.timestamp),
    baseSensitivity: calibration.baseSensitivity,
    detectorType: calibration.detectorType,
    customRSF: calibration.customRSF,
    semVoltageAtCalibration: calibration.semVoltageAtCalibration,
    measurements: calibration.measurements,
    updatedAt: serverTimestamp(),
  }

  await setDoc(docRef, firestoreData)
}

/**
 * Lädt eine Geräte-Kalibrierung aus Firestore
 */
export async function getDeviceCalibration(
  userId: string,
  deviceId: string
): Promise<DeviceCalibration | null> {
  const docRef = doc(getUserCalibrationsRef(userId), deviceId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  const data = docSnap.data() as FirestoreDeviceCalibration

  return {
    deviceId: data.deviceId,
    timestamp: data.timestamp.toDate(),
    baseSensitivity: data.baseSensitivity,
    detectorType: data.detectorType,
    customRSF: data.customRSF,
    semVoltageAtCalibration: data.semVoltageAtCalibration,
    measurements: data.measurements,
  }
}

/**
 * Lädt alle Geräte-Kalibrierungen eines Users
 */
export async function getAllDeviceCalibrations(
  userId: string
): Promise<DeviceCalibration[]> {
  const snapshot = await getDocs(getUserCalibrationsRef(userId))

  return snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreDeviceCalibration
    return {
      deviceId: data.deviceId,
      timestamp: data.timestamp.toDate(),
      baseSensitivity: data.baseSensitivity,
      detectorType: data.detectorType,
      customRSF: data.customRSF,
      semVoltageAtCalibration: data.semVoltageAtCalibration,
      measurements: data.measurements,
    }
  })
}

/**
 * Löscht eine Geräte-Kalibrierung
 */
export async function deleteDeviceCalibration(
  userId: string,
  deviceId: string
): Promise<void> {
  const docRef = doc(getUserCalibrationsRef(userId), deviceId)
  await deleteDoc(docRef)
}

/**
 * Lädt die zuletzt verwendete Kalibrierung (nach timestamp sortiert)
 */
export async function getLatestDeviceCalibration(
  userId: string
): Promise<DeviceCalibration | null> {
  const calibrations = await getAllDeviceCalibrations(userId)

  if (calibrations.length === 0) return null

  // Sortiere nach timestamp (neueste zuerst)
  calibrations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return calibrations[0]
}
