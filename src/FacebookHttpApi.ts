import BaseFacebookHttpApi from "./BaseFacebookHttpApi"
import FacebookApiHttpRequest from "./FacebookApiHttpRequest"
import AuthTokens from "./types/AuthTokens"

/**
 * This class will make specific requests to the facebook API utilizing their sick http logic implemented by BaseFacebookHttpApi.
 */
export default class FacebookHttpApi extends BaseFacebookHttpApi {
    /**
     * @see QFacebookHttpApi::auth
     * @param email
     * @param password
     */
    async auth(email: string, password: string): Promise<AuthTokens> {
        return this.get(
            new FacebookApiHttpRequest(
                "https://b-api.facebook.com/method/auth.login",
                "auth.login",
                "authenticate",
                { email, password }
            )
        ).then(res => {
            if (!res.access_token) {
                console.dir(res)
                throw new Error("Access token missing!")
            }
            this.token = res.access_token
            return res
        })
    }

    /**
     * @see QFacebookHttpApi::usersQuery
     */
    async userQuery(userId: string) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "UsersQuery",
                {
                    query_id: "10153915107411729",
                    query_params: JSON.stringify({
                        "0": [ userId ],
                        "1": true
                    })
                }
            )
        )
    }

    /**
     * @see QFacebookHttpApi::usersQuery
     */
    async usersQuery(userId: string, count: number) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "FetchContactsFullQuery",
                {
                    query_id: "10154444360806729",
                    query_params: JSON.stringify({
                        "0": [ userId ],
                        "1": count
                    })
                }
            )
        )
    }

    /**
     * @see QFacebookHttpApi::usersQueryAfter
     * @param cursor
     */
    async usersQueryAfter(userId: string, count: number, cursor: string) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "FetchContactsFullWithAfterQuery",
                {
                    query_id: "10154444360816729",
                    query_params: JSON.stringify({
                        "0": [ userId ],
                        "1": cursor,
                        "2": count
                    })
                }
            )
        )
    }

    /**
     * @see QFacebookHttpApi::usersQueryDelta
     * @param deltaCursor
     */
    async usersQueryDelta(userId: string, deltaCursor: string) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "FetchContactsDeltaQuery",
                {
                    query_id: "10154444360801729",
                    query_params: JSON.stringify({
                        "0": deltaCursor,
                        "1": [ userId ],
                        "2": "500"
                    })
                }
            )
        )
    }

    /**
     * @see QFacebookHttpApi::threadListQuery
     */
    async threadListQuery(count: number) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "ThreadListQuery",
                {
                    query_id: "2000270246651497",
                    query_params: JSON.stringify({ 
                        "11": "true",
                        "23": count, // how many threads to get
                        "3": "false", // show only IDs for messaging actors
                        "27": "false", // show booking requests
                        "5": "false",
                        "10": "false", // show messages
                        "17": 20,
                        "18": 880,
                        "19": 220,
                        "20": 138,
                        "31": "3"
                    })
                }
            )
        )
    }

    /**
     * @param threadId
     * @see facebook-api.c:3317
     */
    async threadQuery(threadId: string) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "ThreadQuery",
                {
                    query_id: "10153919752036729",
                    query_params: JSON.stringify({
                        "0": [ threadId ],
                        "10": false, // show only IDs for messaging actors
                        "11": false, // show messages
                        "13": true // show more details for messaging actors
                    })
                }
            )
        )
    }

    async querySeqId() {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "",
                {
                    query_id: "10155268192741729",
                    query_params: JSON.stringify({ "1": "0" })
                }
            )
        )
    }

    /**
     * @see QFacebookHttpApi::unreadThreadListQuery
     * @param unreadCount
     */
    async unreadThreadListQuery(unreadCount: number) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "ThreadListQuery",
                {
                    query_id: "10153919752026729",
                    query_params: JSON.stringify({
                        "1": unreadCount,
                        "2": true,
                        "12": true,
                        "13": false
                    })
                }
            )
        )
    }

    /**
     * @param mid Message ID
     * @param aid Attachment ID
     */
    async getAttachment(mid: string, aid: string) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://api.facebook.com/method/messaging.getAttachment",
                "messaging.getAttachment",
                "",
                { mid, aid }
            )
        ).then(res => {
            console.dir(res)
            return res
        })
    }
    /**
     * @todo implement unreadMessagesListQuery when we have QFacebookUid
     */
}
