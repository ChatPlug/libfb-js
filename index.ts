import login from './src/FBMessenger';

let config
try {
  config = require('./config.json')
} catch (err) {
  console.dir(err)
  process.exit(1)
}

login(config.email, config.password).then().catch()