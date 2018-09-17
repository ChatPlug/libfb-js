import AuthTokens from "./types/AuthTokens";

interface TokenStorage {
  readSession(): Promise<AuthTokens|null>;
  writeSession(ses: AuthTokens): Promise<void>;
}
export default TokenStorage;
