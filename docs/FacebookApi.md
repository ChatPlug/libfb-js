## FacebookApi

**Methods:**
- [`sendMessage`](#sendMessage)
- [`getSession`](#getSession)
- [`getThreadList`](#getThreadList)
- [`sendAttachmentFile`](#sendAttachmentFile)
- [`sendAttachmentStream`](#sendAttachmentStream)
- [`getAttachmentURL`](#getAttachmentURL)
- [`getStickerURL`](#getStickerURL)
- [`getThreadInfo`](#getThreadInfo)
- [`getUserInfo`](#getUserInfo)

<a name="sendMessage"><h2>.sendMessage(threadId, message)</h2></a>
> Sends a message to a thread.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| threadId | [number] | ID of the thread you want to send a message to |
| message | [string] | Body of the message |

**Returns: [Promise]<[`SentMessageInfo`](#SentMessageInfo)>**

<a name="getSession"><h2>.getSession()</h2></a>
> Gets a Facebook session.

**Returns: [`Session`](Session.md)**

<a name="getThreadList"><h2>.getThreadList(count)</h2></a>
> Gets a list of Facebook threads.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| count | [number] | Number of threads you want to get |

**Returns: [Promise]<[Array]<[`Thread`](Thread.md)>>**

<a name="sendAttachmentFile"><h2>.sendAttachmentFile(threadId, path)</h2></a>
> Sends an attachment from a disk.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| threadId | [number] | ID of the thread you want to send an attachment to |
| path | [string] | Path of the attachment |

**Returns: [Promise]<`void`>**

<a name="sendAttachmentStream"><h2>.sendAttachmentStream(threadId, extension, stream)</h2></a>
> Sends an attachment from a readable stream.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| threadId | [number] | ID of the thread you want to send an attachment to |
| extension | [string] | Extension/mimetype of the attachment |
| stream | [Readable] | Stream of the attachment |

**Returns: [Promise]<`void`>**

<a name="getAttachmentURL"><h2>.getAttachmentURL(messageId, attachmentId)</h2></a>
> Gets an URL from a message attachment.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| messageId | [string] | ID of the message this attachment came with |
| attachmentId | [string] | ID of the attachment |

**Returns: [Promise]<[string]>**

<a name="getStickerURL"><h2>.getStickerURL(stickerId)</h2></a>
> Gets an URL for a sticker.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| stickerId | [string] | ID of the sticker |

**Returns: [Promise]<[string]>**

<a name="getThreadInfo"><h2>.getThreadInfo(threadId)</h2></a>
> Gets thread info by thread ID.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| threadId | [string] | ID of the thread |

**Returns: [Promise]<[`Thread`](Thread.md)>**

<a name="getUserInfo"><h2>.getUserInfo(userId)</h2></a>
> Gets user info by user ID.

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| userId | [string] | ID of the user |

**Returns: [Promise]<[`User`](User.md)>**




[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[Readable]: https://nodejs.org/api/stream.html#stream_class_stream_readable