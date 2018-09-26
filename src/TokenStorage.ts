import Session from "./types/Session"

interface TokenStorage {
    readSession(): Session | null
    writeSession(ses: Session)
}
export default TokenStorage
