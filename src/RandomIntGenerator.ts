export default class RandomIntGenerator {
  static generate () {
    return Math.floor(Math.random() * (Math.pow(2, 32) + 1))
  }
}
