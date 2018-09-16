import { TTransport } from "thrift"

export default interface Message {
    encode(trans: TTransport)
    decode()
}
