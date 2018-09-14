import FacebookApiHttpRequest from "./FacebookApiHttpRequest";
import crypto from "crypto";

/**
 * This class wil implement making sick fucking http requests to facebook API by ZUCC.
 * Plz kill me
 * @todo https://github.com/chyla/Kadu/blob/master/plugins/facebook_protocol/qfacebook/http/qfacebook-http-api.cpp#L107
 */
export default class BaseFacebookHttpApi {
  deviceId: string;
  get(request: FacebookApiHttpRequest) {
    request.params["api_key"] = "256002347743983";
    request.params["device_id"] = this.deviceId;
    request.params["fb_api_req_friendly_name"] = request.friendlyName;
    request.params["format"] = "json";
    request.params["method"] = request.method;
    request.params["local"] = "pl_PL";
    let dataToHash = "";
    request.sortedKeys().forEach(k => {
      dataToHash += k + "=" + request.params[k];
    });
    dataToHash += "374e60f8b9bb6b8cbb30f78030438895"; // ??? xDDDDDD wtf XD
    const sig = crypto
      .createHash("md5")
      .update(dataToHash)
      .digest("hex");
    request.params["sig"] = sig;

    const resultingUrl = request.url + request.serializeParams();
    

    throw new Error("not yet");
  }
}
