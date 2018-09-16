import makeDeviceId from "./FacebookDeviceId";
import FacebookHttpApi from "./FacebookHttpApi";
import PlainFileTokenStorage from "./PlainFileTokenStorage";
import Connect from "./mqqt/messages/Connect";
import MqttConnection from "./mqqt/MqttConnection";

const login = async (email: string, password: string) => {
  const storage = new PlainFileTokenStorage();
  const deviceId = makeDeviceId();
  const api = new FacebookHttpApi();
  api.deviceId = deviceId.deviceId;

  let tokens = await storage.readSession();
  if (!tokens) {
    tokens = await api.auth(email, password);
    storage.writeSession(tokens);
  } else {
    api.token = tokens.access_token;
  }

  const conenction = new MqttConnection();
  conenction.connectMsg = await (new Connect()).encode(tokens, deviceId)
  await conenction.connect()
  while(1) {}
};

export default login;