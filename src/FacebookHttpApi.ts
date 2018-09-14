import BaseFacebookHttpApi from "./BaseFacebookHttpApi";
import FacebookApiHttpRequest from "./FacebookApiHttpRequest";

/**
 * This class will make specific requests to the facebook API utilizing their sick http logic implemented by BaseFacebookHttpApi.
 */
export default class FacebookHttpApi extends BaseFacebookHttpApi {
  /**
   * @see QFacebookHttpApi::auth
   * @param email
   * @param password
   */
  async auth(email: string, password: string) {
    const request = new FacebookApiHttpRequest(
      "https://b-api.facebook.com/method/auth.login",
      null,
      "auth.login",
      "authenticate",
      { email, password }
    )
    return this.get(request);
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
