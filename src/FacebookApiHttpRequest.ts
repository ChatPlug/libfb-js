import {} from "url";

export interface RequestParams {
  [x: string]: string;
}

/**
 * COntains all data used by custom facebook http logic.
 */
export default class FacebookApiHttpRequest {
  constructor(
    public url: string,
    public token: string,
    public method: string,
    public friendlyName: string,
    public params: RequestParams
  ) {}
  sortedKeys() {
    const keys = Object.keys(this.params);
    keys.sort();
    return keys;
  }
  serializeParams() {
    const data = this.sortedKeys()
      .map(
        k => encodeURIComponent(k) + "=" + encodeURIComponent(this.params[k])
      )
      .join("&");
    return data;
  }
}
