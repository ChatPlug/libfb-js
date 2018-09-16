import MqttConnection from "../src/mqqt/MqttConnection";

describe("MqttConnection", function() {
  it.skip("connects", async function() {
    const conn = new MqttConnection();
    await conn.connect();
  });
});
