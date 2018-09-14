import BaseFacebookHttpApi from "./BaseFacebookHttpApi";

/**
 * This class will make specific requests to the facebook API utilizing their sick http logic implemented by BaseFacebookHttpApi.
 */
export default class FacebookHttpApi extends BaseFacebookHttpApi {
  /**
   * @see QFacebookHttpApi::auth
   * @todo IMPLEMENT
   * @param user
   * @param password
   */
  async auth(user: string, password: string) {
    throw new Error("not yet");
  }

  /**
   * @see QFacebookHttpApi::usersQuery
   * @todo IMPLEMENT
   * @param token
   */
  async usersQuery(token: string) {
    throw new Error("not yet");
  }

  /**
   * @see QFacebookHttpApi::usersQueryAfter
   * @todo IMPLEMENT
   * @param token
   */
  async usersQueryAfter(token: string, cursor: string) {
    throw new Error("not yet");
  }

  /**
   * @see QFacebookHttpApi::usersQueryDelta
   * @todo IMPLEMENT
   * @param token
   */
  async usersQueryDelta(token: string, deltaCursor: string) {
    throw new Error("not yet");
  }

  /**
   * @see QFacebookHttpApi::threadListQuery
   * @todo IMPLEMENT
   * @param token
   */
  async threadListQuery(token: string) {
    throw new Error("not yet");
  }

  /**
   * @see QFacebookHttpApi::unreadThreadListQuery
   * @todo IMPLEMENT
   * @param token
   * @param unreadCount
   */
  async unreadThreadListQuery(token: string, unreadCount: number) {
    throw new Error("not yet");
  }

  /**
   * @todo implement unreadMessagesListQuery when we have QFacebookUid
   */
}
