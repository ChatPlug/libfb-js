## Thread

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| id | [number] | Thread ID |
| name | [string] | Thread name |
| isGroup | [boolean] | True if thread is a group |
| participants | [Array]<[`User`]> | Participants of the thread |
| image | [string] | Thread image |
| unreadCount | [number] | Count of unread messages |
| canReply | [boolean] | True if current user can reply |
| cannotReplyReason | [string] | Reason why user can't reply |
| isArchived | [boolean] | True if thread is archived |
| color | [string] | Thread color (format: `#AABBCC`) |
| emoji | [string] | Thread emoji |
| nicknames | [Array]<> \| `null` | Nicknames of participants |

[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array

[`User`]: User.md