export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  provider: "firebase" | "local";
}
