import CryptoJS from "crypto-js"

const SECRET_KEY = "GROUPY_CHAT_SECRET_KEY_2026"

// Type guard
const isValidValue = (value: unknown): value is string | number => {
    return value !== null && value !== undefined && value !== ""
}
  
const encryptId = (value?: string | number | null): string | null => {
    if (!isValidValue(value)) {
        console.warn("encryptId: Invalid value")
        return null
    }

    try {
        return CryptoJS.AES.encrypt(value.toString(), SECRET_KEY).toString()
    } catch (error) {
        console.error("Encryption failed:", error)
        return null
    }
}

const decryptId = (encrypted?: string | null): string | null => {
    if (!encrypted) {
        console.warn("decryptId: No encrypted value provided")
        return null
    }

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)

        if (!decrypted) {
        console.warn("decryptId: Invalid or tampered data")
        return null
        }

        return decrypted
    } catch (error) {
        console.error("Decryption failed:", error)
        return null
    }
}

export { encryptId, decryptId }
