import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where
} from "firebase/firestore";

import { getFirebaseClientDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { readLocalStorage, writeLocalStorage } from "@/lib/utils/local-storage";
import type { AuthUser } from "@/types/auth";
import type { LabProgressRecord } from "@/types/lab";
import type {
  SaveProjectInput,
  SavedProject,
  UserProfileRecord,
  UserSettingsRecord
} from "@/types/project";

const LOCAL_PROJECTS_KEY = "netverse.local.projects";
const LOCAL_PROGRESS_KEY = "netverse.local.lab-progress";
const LOCAL_USERS_KEY = "netverse.local.users";

function sortNewestFirst<T extends { updatedAt: string }>(records: T[]) {
  return [...records].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function getLocalProjects() {
  return readLocalStorage<SavedProject[]>(LOCAL_PROJECTS_KEY, []);
}

function setLocalProjects(projects: SavedProject[]) {
  writeLocalStorage(LOCAL_PROJECTS_KEY, projects);
}

function getLocalProgress() {
  return readLocalStorage<LabProgressRecord[]>(LOCAL_PROGRESS_KEY, []);
}

function setLocalProgress(progress: LabProgressRecord[]) {
  writeLocalStorage(LOCAL_PROGRESS_KEY, progress);
}

function getLocalUsers() {
  return readLocalStorage<Record<string, UserProfileRecord>>(LOCAL_USERS_KEY, {});
}

function setLocalUsers(users: Record<string, UserProfileRecord>) {
  writeLocalStorage(LOCAL_USERS_KEY, users);
}

export async function ensureUserProfile(user: AuthUser) {
  const payload: UserProfileRecord = {
    displayName: user.displayName,
    email: user.email,
    createdAt: new Date().toISOString(),
    level: "Explorer"
  };

  if (!isFirebaseConfigured) {
    const users = getLocalUsers();
    if (!users[user.uid]) {
      users[user.uid] = payload;
      setLocalUsers(users);
    }
    return users[user.uid] ?? payload;
  }

  const db = getFirebaseClientDb();
  if (!db) {
    return payload;
  }

  const reference = doc(db, "users", user.uid);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    await setDoc(reference, payload);
    await setDoc(doc(db, "userSettings", user.uid), {
      theme: "dark",
      preferences: {
        onboardingSeen: false
      }
    } satisfies UserSettingsRecord);
    return payload;
  }

  return snapshot.data() as UserProfileRecord;
}

export async function listProjects(userId: string) {
  if (!isFirebaseConfigured) {
    return sortNewestFirst(getLocalProjects().filter((project) => project.userId === userId));
  }

  const db = getFirebaseClientDb();
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, "projects"), where("userId", "==", userId), orderBy("updatedAt", "desc"))
  );

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as SavedProject);
}

export async function getProject(userId: string, projectId: string) {
  if (!isFirebaseConfigured) {
    return getLocalProjects().find((project) => project.userId === userId && project.id === projectId) ?? null;
  }

  const db = getFirebaseClientDb();
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "projects", projectId));
  if (!snapshot.exists()) {
    return null;
  }

  const project = { id: snapshot.id, ...snapshot.data() } as SavedProject;
  return project.userId === userId ? project : null;
}

export async function saveProject(userId: string, input: SaveProjectInput) {
  const now = new Date().toISOString();
  const record: SavedProject = {
    id: input.id ?? crypto.randomUUID(),
    userId,
    title: input.title,
    topology: input.topology,
    createdAt: now,
    updatedAt: now
  };

  if (!isFirebaseConfigured) {
    const projects = getLocalProjects().filter((project) => !(project.userId === userId && project.id === record.id));
    const existing = getLocalProjects().find((project) => project.userId === userId && project.id === record.id);
    setLocalProjects([...projects, existing ? { ...existing, ...record, createdAt: existing.createdAt } : record]);
    return record;
  }

  const db = getFirebaseClientDb();
  if (!db) {
    return record;
  }

  const reference = doc(db, "projects", record.id);
  const snapshot = await getDoc(reference);

  await setDoc(reference, {
    ...record,
    createdAt: snapshot.exists() ? (snapshot.data().createdAt as string) : record.createdAt
  });

  return {
    ...record,
    createdAt: snapshot.exists() ? (snapshot.data().createdAt as string) : record.createdAt
  };
}

export async function listLabProgress(userId: string) {
  if (!isFirebaseConfigured) {
    return sortNewestFirst(getLocalProgress().filter((entry) => entry.userId === userId));
  }

  const db = getFirebaseClientDb();
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(
    query(collection(db, "labProgress"), where("userId", "==", userId), orderBy("updatedAt", "desc"))
  );

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as LabProgressRecord);
}

export async function upsertLabProgress(userId: string, labId: string, completed: boolean, score: number) {
  const record: LabProgressRecord = {
    id: `${userId}_${labId}`,
    userId,
    labId,
    completed,
    score,
    updatedAt: new Date().toISOString()
  };

  if (!isFirebaseConfigured) {
    const next = getLocalProgress().filter((entry) => entry.id !== record.id);
    setLocalProgress([...next, record]);
    return record;
  }

  const db = getFirebaseClientDb();
  if (!db) {
    return record;
  }

  await setDoc(doc(db, "labProgress", record.id), record);
  return record;
}
