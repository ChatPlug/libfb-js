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
    async usersQuery() {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "UsersQuery",
                {
                    query_id: "10154444360806729",
                    query_params: JSON.stringify({
                        "0": ["user"],
                        "1": "50"
                    })
                }
            )
        )
    }

    /**
     * @see QFacebookHttpApi::usersQueryAfter
     * @param cursor
     */
    async usersQueryAfter(cursor: string) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "FetchContactsFullWithAfterQuery",
                {
                    query_id: "10154444360816729",
                    query_params: JSON.stringify({
                        "0": ["user"],
                        "1": cursor,
                        "2": "50"
                    })
                }
            )
        )
    }

    /**
     * @see QFacebookHttpApi::usersQueryDelta
     * @param deltaCursor
     */
    async usersQueryDelta(deltaCursor: string) {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "FetchContactsDeltaQuery",
                {
                    query_id: "10154444360801729",
                    query_params: JSON.stringify({
                        "0": deltaCursor,
                        "1": ["user"],
                        "2": "500"
                    })
                }
            )
        )
    }

    /**
     * @see QFacebookHttpApi::threadListQuery
     */
    async threadListQuery() {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "ThreadListQuery",
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
     * 
     */
    async querySeqId() {
        return this.get(
            new FacebookApiHttpRequest(
                "https://graph.facebook.com/graphql",
                "get",
                "",
                {
                    query_id: "10155268192741729",
                    query_params: JSON.stringify({
                        "1": "0"
                    })
                }
            )
        )
    }
    /**
     * @todo implement unreadMessagesListQuery when we have QFacebookUid
     */
}
