import FacebookApi, { FacebookApiOptions } from "./FacebookApi"
export { default as AuthTokens } from "./types/AuthTokens"
export { default as DeviceId } from "./types/DeviceId"
export { default as Message } from "./types/Message"
export { default as Session } from "./types/Session"
export { default as Thread } from "./types/Thread"
export { default as User } from "./types/User"
export * from "./types/Events"

const login = async (email: string, password: string, options?: FacebookApiOptions): Promise<FacebookApi> => {
    if (!email || !email.trim() || !password || !password.trim())
        throw new Error("Wrong username/password!") // trim to check for spaces (which are truthy)
    const api = new FacebookApi(options)
    await api.doLogin(email, password)
    return api
}

export {
    login,
    FacebookApiOptions,
    FacebookApi
}
