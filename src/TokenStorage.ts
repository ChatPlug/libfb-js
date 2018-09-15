import * as fs from 'fs'
import * as path from 'path'
import AuthTokens from './types/AuthTokens';
const CONFIG_FILE_PATH = path.join(__dirname, '../session.json')

export default class TokenStorage {
    readSession() : AuthTokens | null {
        const exists = fs.existsSync(CONFIG_FILE_PATH)
        if (!exists) {
            return null
        }

        return JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8')) as AuthTokens
    }

    writeSession(tokens: AuthTokens) {
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(tokens))
    }
}