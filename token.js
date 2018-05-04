const { fetch_api } = require("./freebox");
const { freebox_app_id } = require("./conf");

const create_token = async () => {
  const auth = await fetch_api("login/authorize/", {
    body: {
      app_id: freebox_app_id,
      app_name: freebox_app_id,
      app_version: "1.0.0",
      device_name: "Node"
    }
  });
  console.log("Response", auth);
};

// create_token();

const list_authorizations = async () => {
  const auth = await fetch_api("login/authorize/8", {
    method: "GET"
  });
  console.log("Response", auth);
};

list_authorizations();
