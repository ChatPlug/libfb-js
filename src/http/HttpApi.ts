import BaseHttpApi from './BaseHttpApi'
import HttpApiRequest from './HttpApiRequest'
import AuthTokens from '../types/AuthTokens'
import GraphQLRequest from './GraphQLRequest'
import { AuthAPIError } from '../types/Errors'

/**
 * This class will make specific requests to the facebook API utilizing their sick http logic implemented by BaseFacebookHttpApi.
 */
export default class HttpApi extends BaseHttpApi {
    /**
     * @see QFacebookHttpApi::auth
     * @param email
     * @param password
     */
  async auth (email: string, password: string): Promise<AuthTokens> {
    return this.post(
            new HttpApiRequest({
              url: 'https://b-api.facebook.com/method/auth.login',
              method: 'auth.login',
              friendlyName: 'authenticate',
              params: { email, password }
            })
        ).then(res => {
          if (!res.access_token) {
            const error = new AuthAPIError(res.error_msg)
            error.code = res.error_code
            error.errorData = JSON.parse(res.error_data)
            error.requestArgs = res.request_args.reduce((prev, current) => ({ ...prev, [current.key]: current.value }), {})
            throw error
          }
          this.token = res.access_token
          return res
        })
  }

    /**
     * @see QFacebookHttpApi::usersQuery
     */
  async userQuery (userId: string) {
    return this.post(
            new GraphQLRequest({
              name: 'UsersQuery',
              params: {
                '0': [ userId ],
                '1': true
              }
            })
        )
  }

    /**
     * @see QFacebookHttpApi::usersQuery
     */
  async usersQuery (userIds: [ string ]) {
    return this.post(
            new GraphQLRequest({
              name: 'FetchContactsFullQuery',
              params: {
                '0': userIds,
                '1': userIds.length
              }
            })
        )
  }

    /**
     * @see QFacebookHttpApi::usersQueryAfter
     * @param userIds
     * @param cursor
     */
  async usersQueryAfter (userIds: [ string ], cursor: string) {
    return this.post(
            new GraphQLRequest({
              name: 'FetchContactsFullWithAfterQuery',
              params: {
                '0': userIds,
                '1': cursor,
                '2': userIds.length
              }
            })
        )
  }

    /**
     * @see QFacebookHttpApi::usersQueryDelta
     * @param userId
     * @param deltaCursor
     */
  async usersQueryDelta (userId: string, deltaCursor: string) {
    return this.post(
            new GraphQLRequest({
              name: 'FetchContactsDeltaQuery',
              params: {
                '0': deltaCursor,
                '1': [ userId ],
                '2': '500'
              }
            })
        )
  }

    /**
     * @see QFacebookHttpApi::threadListQuery
     */
  async threadListQuery (count: number) {
    return this.post(
            new GraphQLRequest({
              name: 'ThreadListQuery',
              params: {
                '11': 'true',
                '23': count, // how many threads to get
                '3': 'false', // show only IDs for messaging actors
                '27': 'false', // show booking requests
                '5': 'false',
                '10': 'false', // show messages
                '17': 20,
                '18': 880,
                '19': 220,
                '20': 138,
                '31': '3'
              }
            })
        )
  }

    /**
     * @param threadId
     * @see facebook-api.c:3317
     */
  async threadQuery (threadId: string) {
    return this.post(
            new GraphQLRequest({
              name: 'ThreadQuery',
              params: {
                '0': [ threadId ],
                '10': false, // show only IDs for messaging actors
                '11': false, // show messages
                '13': true // show more details for messaging actors
              }
            })
        )
  }

  async threadMessagesQuery (threadId: string, count: number) {
    return this.post(
            new GraphQLRequest({
              name: 'ThreadQuery',
              params: {
                '0': [ threadId ],
                '11': true, // show messages
                '12': count
              }
            })
        )
  }

  async querySeqId () {
    return this.post(
            new GraphQLRequest({
              name: 'SeqIdQuery',
              params: {
                '1': '0'
              }
            })
        )
  }

    /**
     * @see QFacebookHttpApi::unreadThreadListQuery
     * @param unreadCount
     */
  async unreadThreadListQuery (unreadCount: number) {
    return this.post(
            new GraphQLRequest({
              name: 'UnreadThreadListQuery',
              params: {
                '1': unreadCount,
                '2': true,
                '12': true,
                '13': false
              }
            })
        )
  }

    /**
     * @param mid Message ID
     * @param aid Attachment ID
     */
  async getAttachment (mid: string, aid: string) {
    return this.post(
            new HttpApiRequest({
              url: 'https://api.facebook.com/method/messaging.getAttachment',
              method: 'messaging.getAttachment',
              friendlyName: '',
              params: { mid, aid }
            })
        )
  }

    /**
     * @param stickerId
     */
  getSticker (stickerId: number) {
    return this.post(
            new GraphQLRequest({
              name: 'FetchStickersWithPreviewsQuery',
              params: {
                '0': [ stickerId ]
              }
            })
        )
  }

    /**
     * @todo implement unreadMessagesListQuery when we have QFacebookUid
     */
}
