const INITIAL_BUFFER_CAPACITY = 8;

export default class MqttWriter {
  buf: Buffer;
  offset: number;
  constructor() {
    this.buf = new Buffer(INITIAL_BUFFER_CAPACITY);
  }
  get cap() {
    return this.buf.length;
  }
  growIfNeeded(newDataBytes: number) {
      let newCap =  this.buf.length;
      while(newDataBytes >= newCap) { // capacity exceeded
        newCap *= 2; // grow twice the size for 
      }
      let newBuf = new Buffer(newCap);
      
  }
  writeUint8() {}
  writeInt64() {}
  writeString() {}
  writeBuffer() {}
}
