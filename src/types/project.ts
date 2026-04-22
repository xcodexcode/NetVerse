import type { TopologySnapshot } from "@/types/simulator";

export interface SavedProject {
  id: string;
  userId: string;
  title: string;
  topology: TopologySnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface SaveProjectInput {
  id?: string;
  title: string;
  topology: TopologySnapshot;
}

export interface UserProfileRecord {
  displayName: string;
  email: string;
  createdAt: string;
  level: string;
}

export interface UserSettingsRecord {
  theme: "dark";
  preferences: {
    onboardingSeen: boolean;
  };
}
