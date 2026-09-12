import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { Subject, Lesson, Summary } from '../types';

export async function syncUserProfileToFirestore(user: {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  subscriptionStatus: 'free' | 'premium';
  subscriptionExpiresAt?: string | null;
}) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveUserProgressToFirestore(
  userId: string,
  progress: {
    completedLessons: string[];
    favoriteLessons: string[];
    favoriteSummaries: string[];
    quizResults: any[];
  }
) {
  const path = `progress/${userId}`;
  try {
    const progressRef = doc(db, 'progress', userId);
    await setDoc(
      progressRef,
      {
        userId,
        completedLessons: progress.completedLessons || [],
        favoriteLessons: progress.favoriteLessons || [],
        favoriteSummaries: progress.favoriteSummaries || [],
        quizResults: progress.quizResults || [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProgressFromFirestore(userId: string) {
  const path = `progress/${userId}`;
  try {
    const progressRef = doc(db, 'progress', userId);
    const snap = await getDoc(progressRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeToSubjects(
  onUpdate: (subjects: Subject[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'subjects';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Subject[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToLessons(
  onUpdate: (lessons: Lesson[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'lessons';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Lesson[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToSummaries(
  onUpdate: (summaries: Summary[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'summaries';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Summary[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
