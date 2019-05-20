import Long from 'long'

export default class RandomIntGenerator {
  // static generate () {
  //   return Math.floor(Math.random() * (Math.pow(2, 32) + 1))
  // }
  static getAttemptId (): Long {
    const sysTime: Long = Long.fromNumber(Date.now()).shiftLeft(22)
    const randomBit: Long = Long.fromNumber(RandomIntGenerator.generate() & 4194303).and(Long.MAX_VALUE)
    return sysTime.or(randomBit)
  }

  static generate () {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER))
  }
}
