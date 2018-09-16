import makeDeviceId from "./FacebookDeviceId";
import FacebookHttpApi from "./FacebookHttpApi";
import PlainFileTokenStorage from "./PlainFileTokenStorage";

const sample = async () => {
  const storage = new PlainFileTokenStorage();
  const deviceId = makeDeviceId();
  const api = new FacebookHttpApi();
  api.deviceId = deviceId.deviceId;

  let tokens = await storage.readSession();
  if (!tokens) {
    tokens = await api.auth("test", "test");
    storage.writeSession(tokens);
  } else {
    api.token = tokens.access_token;
  }
  //console.log(JSON.stringify(await api.usersQuery(), null, 4));
  console.log("done");
};

sample()
  .then()
  .catch();
