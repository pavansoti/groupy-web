/**
 * Cookie utility functions
 * 
 * Why Cookies for Auth?
 * ✅ HttpOnly flag prevents XSS attacks
 * ✅ Automatically sent with requests
 * ✅ Server-side validation support
 * ✅ Proper expiration control
 * ✅ Industry standard for JWT tokens
 */

/**
 * Get a cookie value by name
 * Client-side only (reads from document.cookie)
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1]
}

/**
 * Set a cookie value
 * Client-side only
 */
// export function setCookie(
//   name: string,
//   value: string,
//   options?: {
//     maxAge?: number // in seconds
//     path?: string
//     domain?: string
//     secure?: boolean
//     sameSite?: 'Strict' | 'Lax' | 'None'
//   }
// ): void {
//   if (typeof document === 'undefined') return

//   let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

//   if (options?.maxAge) {
//     cookieString += `; Max-Age=${options.maxAge}`
//   }
//   if (options?.path) {
//     cookieString += `; Path=${options.path}`
//   }
//   if (options?.domain) {
//     cookieString += `; Domain=${options.domain}`
//   }
//   if (options?.secure) {
//     cookieString += '; Secure'
//   }
//   if (options?.sameSite) {
//     cookieString += `; SameSite=${options.sameSite}`
//   }

//   document.cookie = cookieString
// }

/**
 * Delete a cookie
 * Client-side only
 */
// export function deleteCookie(name: string, path?: string): void {
//   setCookie(name, '', {
//     maxAge: 0,
//     path: path || '/',
//   })
// }

/**
 * Check if auth token exists
 */
// export function hasAuthToken(): boolean {
//   return !!getCookie('token')
// }
