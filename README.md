# libfb-js

> Facebook chat MQTT library for Node.js

![npm](https://img.shields.io/npm/v/libfb.svg?style=for-the-badge) &nbsp;
[![npm](https://img.shields.io/npm/dt/libfb.svg?style=for-the-badge)](https://npmjs.com/package/libfb) &nbsp;
![love](https://img.shields.io/badge/Built%20with-%E2%9D%A4%20LOVE-red.svg?longCache=true&style=for-the-badge)

## Example usage

### Echo bot

```js
const { Client } = require('libfb')
const client = new Client()
client.login('username', 'password').then(() => {
  client.on('message', message => {
    console.log('Got a message!')
    console.log(message.message)
    client.sendMessage(message.threadId, message.message)
  })
})
```

### Chat greeting

```js
const { Client } = require('libfb')
const client = new Client()
client.login('username', 'password').then(() => {
  client.on('participantsAddedToGroupThreadEvent', async event => {
    const user = await client.getUserInfo(event.participantIds[0])
    client.sendMessage(event.threadId, `Hello, ${user.name}!`)
  })
})
```

## Documentation
See [here](https://chatplug.github.io/libfb-js/)


## Disclaimer

> We do not guarantee that this product will work correctly. Use only with [whitehat accounts](https://www.facebook.com/whitehat/accounts/) for research/educational purposes. We are not responsible for getting banned on Facebook.  
> MQTT connection logic was based on [bitlbee-facebook](https://github.com/bitlbee-facebook).  
> All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.  
> "Facebook" is a registered trademark of Facebook, Inc., used under license agreement.
