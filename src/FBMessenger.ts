import FacebookApi, { FacebookApiOptions } from "./FacebookApi"

const login = async (email: string, password: string, options: FacebookApiOptions): Promise<FacebookApi> => {
    if (!email || !email.trim() || !password || !password.trim())
        throw new Error("Wrong username/password!") // trim to check for spaces (which are truthy)
    const api = new FacebookApi(options)
    await api.doLogin(email, password)
    return api
}

export default login
