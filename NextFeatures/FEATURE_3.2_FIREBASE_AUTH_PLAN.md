# Firebase Authentication Migration

## Status: Geplant

## Problem

Das aktuelle Authentifizierungssystem (Name + PIN) hat folgende Limitierungen:

1. **Kein Passwort-Reset möglich** - User-ID = `hash(name + pin)`, daher ändert sich bei neuem PIN die gesamte ID
2. **Keine E-Mail-Verifizierung** - Identität nicht überprüfbar
3. **Kein SSO** - Für Konzern-Einsatz wird Microsoft/Google Login benötigt
4. **Nicht skalierbar** - Selbstgebaute Lösung für öffentliche Nutzung nicht geeignet
5. **Admin-Reset unmöglich** - PIN ist gehasht, ID hängt vom PIN ab

## Lösung

Migration zu **Firebase Authentication** mit E-Mail + Passwort.

## Features nach Migration

- E-Mail + Passwort Login
- "Passwort vergessen" per E-Mail (automatisch von Firebase)
- E-Mail-Verifizierung
- Optional: Google / Microsoft SSO (wichtig für Konzern)
- Account-Verwaltung in Firebase Console
- Skaliert automatisch

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/firebase/simpleAuth.ts` | Komplett ersetzen durch Firebase Auth SDK |
| `src/lib/firebase/config.ts` | `getAuth()` hinzufügen |
| `src/components/Auth/SimpleLoginModal.tsx` | Umbauen auf E-Mail + Passwort |
| `src/components/Auth/UserBadge.tsx` | Anpassen an neues User-Objekt |
| `src/types/firebase.ts` | User-Type anpassen |
| `src/store/useAppStore.ts` | User-State anpassen |
| Neue Datei | `src/components/Auth/ForgotPasswordModal.tsx` |
| Neue Datei | `src/components/Auth/RegisterModal.tsx` (optional) |

## Implementierungsschritte

### Phase 1: Basis-Auth (E-Mail + Passwort)

1. Firebase Auth in Firebase Console aktivieren (E-Mail/Passwort Provider)
2. `firebase/auth` SDK integrieren
3. Neue Auth-Funktionen implementieren:
   - `registerUser(email, password, displayName)`
   - `loginUser(email, password)`
   - `logoutUser()`
   - `resetPassword(email)`
   - `onAuthStateChanged()` Listener
4. Login-Modal umbauen:
   - E-Mail-Feld statt Name
   - Passwort-Feld statt PIN
   - "Passwort vergessen" Link
5. Registrierung hinzufügen (separates Modal oder Tab)
6. User-Session über Firebase Auth State (nicht mehr localStorage)

### Phase 2: SSO für Konzern (optional)

1. Google Provider aktivieren
2. Microsoft Provider aktivieren (Azure AD)
3. SSO-Buttons im Login-Modal hinzufügen
4. Redirect-Flow oder Popup-Flow implementieren

### Phase 3: Erweiterte Features (optional)

1. E-Mail-Verifizierung erzwingen
2. Passwort-Richtlinien (Mindestlänge, Komplexität)
3. Multi-Factor Authentication (MFA)
4. Account-Löschung (DSGVO)

## Datenmigration

### Bestehende User

Bestehende User (Name + PIN) können **nicht automatisch migriert** werden, da:
- Keine E-Mail-Adressen vorhanden
- PIN ist gehasht (nicht wiederherstellbar)

**Empfehlung:** Bestehende User müssen sich neu registrieren.

### Bestehende Daten (Calibrations, Settings)

Firestore-Daten sind an die alte User-ID (`hash(name+pin)`) gebunden. Optionen:

1. **Sauberer Schnitt** - Alte Daten verwaisen, User starten neu
2. **Manuelle Migration** - Admin verknüpft alte Daten mit neuer Firebase UID
3. **Self-Service Migration** - User gibt alten Name+PIN ein, Daten werden übertragen

## Code-Beispiele

### Neue Auth-Funktionen (simpleAuth.ts → auth.ts)

```typescript
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User
} from 'firebase/auth'
import { app } from './config'

const auth = getAuth(app)

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential.user
}

export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function logoutUser(): Promise<void> {
  await signOut(auth)
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback)
}
```

### Auth State im Store

```typescript
// In useAppStore.ts
import { subscribeToAuthState } from '@/lib/firebase/auth'

// Im Store initialisieren:
subscribeToAuthState((firebaseUser) => {
  if (firebaseUser) {
    setCurrentUser({
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Unknown',
      email: firebaseUser.email || '',
    })
  } else {
    setCurrentUser(null)
  }
})
```

## Geschätzter Aufwand

- Phase 1 (Basis): 2-4 Stunden
- Phase 2 (SSO): 1-2 Stunden
- Phase 3 (Erweitert): Nach Bedarf

## Risiken

1. **Breaking Change** - Bestehende User müssen sich neu registrieren
2. **Datenverlust** - Alte Calibrations/Settings müssen migriert werden
3. **E-Mail erforderlich** - Nicht alle User wollen E-Mail angeben

## Entscheidungen offen

- [ ] Soll Registrierung und Login getrennt oder kombiniert sein?
- [ ] Soll E-Mail-Verifizierung Pflicht sein?
- [ ] Wie werden bestehende Daten migriert?
- [ ] Welche SSO-Provider werden benötigt?
