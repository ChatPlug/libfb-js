import { TCompactProtocol, TBufferedTransport, Thrift } from "thrift"

describe("thriftTests", function() {
    it.skip("raw api works", function() {
        const inWriter = TBufferedTransport.receiver((trans, seqid) => {
            ;(trans as any).onFlush = d => console.log("for sending: ", d) // send to socket
            const proto = new TCompactProtocol(trans)
            proto.writeFieldBegin("dupa_testowa", Thrift.Type.BOOL, 1)
            proto.writeBool(true)
            proto.writeFieldEnd()
            proto.flush()
            console.log(
                proto.readFieldBegin(),
                proto.readBool(),
                proto.readFieldEnd()
            )
        }, 0)

        inWriter(Buffer.from([0x11])) // data from socket
    })
    it("ThriftHelper works", function() {})
})
