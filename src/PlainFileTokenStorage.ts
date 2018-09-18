import * as fs from 'fs'
import * as path from 'path'
import AuthTokens from './types/AuthTokens';
import TokenStorage from './TokenStorage';
import Session from './types/Session'
const CONFIG_FILE_PATH = path.join(__dirname, '../session.json')

export default class PlainFileTokenStorage implements TokenStorage {
    readSession(): Session|null {
        const exists = fs.existsSync(CONFIG_FILE_PATH)
        if (!exists) {
            return null
        }

        return JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8')) as Session
    }

    writeSession(session: Session) {
        const exists = fs.existsSync(CONFIG_FILE_PATH)
        if (exists) {
            const oldSes = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8')) as Session
            if (!session.tokens) {
                session.tokens = oldSes.tokens
            }

            if (!session.deviceId) {
                session.deviceId = oldSes.deviceId
            }
        }
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(session))
    }
}
