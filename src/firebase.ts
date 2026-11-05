import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Master switch: Live Firebase Multi-Device Sync Enabled
export const FIREBASE_SYNC_ENABLED = true;

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.warn('Firestore Warning: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test on boot
async function testFirestoreConnection() {
  if (!FIREBASE_SYNC_ENABLED || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or pending connection.');
    }
  }
}
testFirestoreConnection();

let currentAuthUser: User | null = null;
const authWaiters: ((user: User) => void)[] = [];

// Automatic anonymous authentication for seamless multi-device persistence
export function initAutomaticAuth(onUserReady: (user: User) => void) {
  if (!FIREBASE_SYNC_ENABLED || !auth) {
    return;
  }

  if (currentAuthUser) {
    onUserReady(currentAuthUser);
    return;
  }

  authWaiters.push(onUserReady);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentAuthUser = user;
      while (authWaiters.length > 0) {
        const cb = authWaiters.shift();
        cb?.(user);
      }
    } else {
      try {
        const cred = await signInAnonymously(auth);
        currentAuthUser = cred.user;
        while (authWaiters.length > 0) {
          const cb = authWaiters.shift();
          cb?.(cred.user);
        }
      } catch (err) {
        console.warn('Anonymous sign-in error:', err);
      }
    }
  });
}

export function getCurrentUserId(): string {
  return auth?.currentUser?.uid || 'health_lt_master';
}

export async function saveLedgerToFirestore(ledgerData: Record<string, unknown>) {
  if (!FIREBASE_SYNC_ENABLED || !db) return;
  const uid = getCurrentUserId();
  try {
    const docRef = doc(db, 'users', uid, 'data', 'ledger');
    await setDoc(docRef, { data: ledgerData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/data/ledger`);
  }
}

export async function savePantryToFirestore(pantryData: unknown[]) {
  if (!FIREBASE_SYNC_ENABLED || !db) return;
  const uid = getCurrentUserId();
  try {
    const docRef = doc(db, 'users', uid, 'data', 'pantry');
    await setDoc(docRef, { items: pantryData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/data/pantry`);
  }
}

export async function saveBenchmarksToFirestore(benchmarksData: unknown) {
  if (!FIREBASE_SYNC_ENABLED || !db) return;
  const uid = getCurrentUserId();
  try {
    const docRef = doc(db, 'users', uid, 'data', 'benchmarks');
    await setDoc(docRef, { benchmarks: benchmarksData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/data/benchmarks`);
  }
}

export function subscribeToFirestoreData(callbacks: {
  onLedgerUpdate?: (data: Record<string, unknown>) => void;
  onPantryUpdate?: (items: unknown[]) => void;
  onBenchmarksUpdate?: (benchmarks: unknown) => void;
  onSyncStatus?: (status: 'connected' | 'offline' | 'syncing') => void;
}) {
  if (!FIREBASE_SYNC_ENABLED || !db) {
    callbacks.onSyncStatus?.('offline');
    return () => {};
  }

  const unsubscribers: (() => void)[] = [];

  const setupSubscriptions = (uid: string) => {
    try {
      callbacks.onSyncStatus?.('syncing');

      // Subscribe to Ledger
      const ledgerDocRef = doc(db, 'users', uid, 'data', 'ledger');
      const unsubLedger = onSnapshot(
        ledgerDocRef,
        (snap) => {
          callbacks.onSyncStatus?.('connected');
          if (snap.exists()) {
            const payload = snap.data();
            if (payload?.data && callbacks.onLedgerUpdate) {
              callbacks.onLedgerUpdate(payload.data);
            }
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${uid}/data/ledger`);
          callbacks.onSyncStatus?.('offline');
        }
      );
      unsubscribers.push(unsubLedger);

      // Subscribe to Pantry
      const pantryDocRef = doc(db, 'users', uid, 'data', 'pantry');
      const unsubPantry = onSnapshot(
        pantryDocRef,
        (snap) => {
          if (snap.exists()) {
            const payload = snap.data();
            if (payload?.items && callbacks.onPantryUpdate) {
              callbacks.onPantryUpdate(payload.items);
            }
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${uid}/data/pantry`);
        }
      );
      unsubscribers.push(unsubPantry);

      // Subscribe to Benchmarks
      const benchDocRef = doc(db, 'users', uid, 'data', 'benchmarks');
      const unsubBench = onSnapshot(
        benchDocRef,
        (snap) => {
          if (snap.exists()) {
            const payload = snap.data();
            if (payload?.benchmarks && callbacks.onBenchmarksUpdate) {
              callbacks.onBenchmarksUpdate(payload.benchmarks);
            }
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${uid}/data/benchmarks`);
        }
      );
      unsubscribers.push(unsubBench);
    } catch (e) {
      console.warn('Subscription error:', e);
      callbacks.onSyncStatus?.('offline');
    }
  };

  initAutomaticAuth((user) => {
    setupSubscriptions(user.uid);
  });

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}
