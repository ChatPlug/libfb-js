import { Thrift, TCompactProtocol, TBufferedTransport } from 'thrift'

export default abstract class Payload {
 /**
  * Write this payload into the specified stream
  */
  encode (proto: TCompactProtocol): Promise<void> {
    return null
  }

  /**
   * Decodes thrift buffer into this payload
   */
  decode (data: Buffer): Promise<void> {
    return null
  }

  /**
   * Get topic this payload should published to
   * Only single-level topics have been observed,
   * but mqtt works with multiple, possibly dynamically
   * generated topics.
   */
  getTopic (): string {
        // Maybe thrown?
    return null
  }

  /**
   * Static convenience method for writing a payload to a
   * buffered transport and returning it as a buffer
   */
  static encodePayload (payload: Payload): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const trans = new TBufferedTransport(null, (msg, seqid) => {
        resolve(msg)
      })

      const proto = new TCompactProtocol(trans)
      payload.encode(proto)

      proto.flush()
    })
  }
}
