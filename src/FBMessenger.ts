import FacebookApi, { FacebookApiOptions } from "./FacebookApi"
import AuthTokens from "./types/AuthTokens"
import DeviceId from "./types/DeviceId"
import Message from "./types/Message"
import { DeliveryReceiptEvent, ReadReceiptEvent } from "./types/Events"
import Session from "./types/Session"
import Thread from "./types/Thread"
import User from "./types/User"



const login = async (email: string, password: string, options?: FacebookApiOptions): Promise<FacebookApi> => {
    if (!email || !email.trim() || !password || !password.trim())
        throw new Error("Wrong username/password!") // trim to check for spaces (which are truthy)
    const api = new FacebookApi(options)
    await api.doLogin(email, password)
    return api
}

export { login, AuthTokens, DeviceId, Message, DeliveryReceiptEvent, ReadReceiptEvent, Session, Thread, User }
