# libfb-js

> Facebook chat MQTT library for Node.js

![npm](https://img.shields.io/npm/v/libfb.svg?style=for-the-badge) &nbsp;
[![npm](https://img.shields.io/npm/dt/libfb.svg?style=for-the-badge)](https://npmjs.com/package/libfb) &nbsp;
![love](https://img.shields.io/badge/Built%20with-%E2%9D%A4%20LOVE-red.svg?longCache=true&style=for-the-badge)

## Example usage

```js
const { login } = require('libfb')
const api = await login('username', 'password')
api.on('message', message => {
  console.log('Got a message!')
  console.log(message.message)
  api.sendMessage(message.threadId, message.message)
})
```

# Documentation
- [`login(email, password, options)`](docs/login)
- [`FacebookApi`](docs/FacebookApi)
- [`FacebookApiOptions`](docs/FacebookApiOptions)
- [`AuthTokens`](docs/AuthTokens)
- [`DeviceId`](docs/DeviceId)
- [`Session`](docs/Session)
- [`Thread`](docs/Thread)
- [`User`](docs/User)
- [`Message`](docs/Message)
- [`ParticipantsAddedToGroupThreadEvent`](docs/ParticipantsAddedToGroupThreadEvent)
- [`ParticipantLeftGroupThreadEvent`](docs/ParticipantLeftGroupThreadEvent)
- [`ThreadNameEvent`](docs/ThreadNameEvent)
- [`ChangeThreadNicknameEvent`](docs/ChangeThreadNicknameEvent)
- [`AddThreadAdminsEvent`](docs/AddThreadAdminsEvent)
- [`FacebookEventGuest`](docs/FacebookEventGuest)
- [`FacebookEvent`](docs/FacebookEvent)
- [`EventCreateEvent`](docs/EventCreateEvent)
- [`EventUpdateTitleEvent`](docs/EventUpdateTitleEvent)
- [`EventUpdateTimeEvent`](docs/EventUpdateTimeEvent)
- [`EventUpdateLocationEvent`](docs/EventUpdateLocationEvent)
- [`EventRsvpEvent`](docs/EventRsvpEvent)
- [`EventDeleteEvent`](docs/EventDeleteEvent)
- [`DeliveryReceiptEvent`](docs/DeliveryReceiptEvent)
- [`ReadReceiptEvent`](docs/ReadReceiptEvent)


## Disclaimer

> We do not guarantee that this product will work correctly. Use only with [whitehat accounts](https://www.facebook.com/whitehat/accounts/) for research/educational purposes. We are not responsible for getting banned on Facebook.  
> MQTT connection logic was based on [bitlbee-facebook](https://github.com/bitlbee-facebook).  
> All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.  
> "Facebook" is a registered trademark of Facebook, Inc., used under license agreement.