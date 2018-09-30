import { TBufferedTransport, TCompactProtocol } from "../thrift"

/**
 * Wraps around the messy thrift API to provide an easy to use API for interacting with TCompactProtocol.
 */
export default class ThriftHelper {
    /**
     * Using this field you can serialize/deserialize data.
     * Please do not call flush on this field, because ThriftHelper does it when reading data.
     */
    proto: TCompactProtocol
    /**
     * Internal buffer used by TCompactProtocol.
     */
    bufferedTransport: TBufferedTransport

    /**
     * Writes data to be decoded by TCompactProtocol.
     * Must be called AFTER init has completed.
     */
    writeData: (d: Buffer) => void

    readData() {
        return new Promise<Buffer>(res => {
            ;(this.bufferedTransport as any).onFlush = data => {
                res(data)
                ;(this.bufferedTransport as any).onFlush = null
            }
            this.proto.flush()
        })
    }

    async init() {
        await new Promise(res => {
            this.writeData = TBufferedTransport.receiver(trans => {
                this.bufferedTransport = trans
                this.proto = new TCompactProtocol(trans)
            }, 0)
        })
    }
}
