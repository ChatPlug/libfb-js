import makeDeviceId from "./FacebookDeviceId";
import FacebookHttpApi from "./FacebookHttpApi";
import PlainFileTokenStorage from "./PlainFileTokenStorage";

const sample = async () => {
  const storage = new PlainFileTokenStorage();
  const deviceId = makeDeviceId();
  const api = new FacebookHttpApi();
  api.deviceId = deviceId.deviceId;

  let tokens = await storage.readSession();
  api.token = tokens.access_token;
  if (!tokens) {
    tokens = await api.auth("test", "test");
    storage.writeSession(tokens);
  }
  //console.log(JSON.stringify(await api.usersQuery(), null, 4));
  console.log("done");
};

sample()
  .then()
  .catch();
