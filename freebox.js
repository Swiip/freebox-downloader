const fs = require("fs");
const https = require("https");
const fetch = require("node-fetch");
const { HmacSHA1 } = require("crypto-js");
const FormData = require("form-data");

const {
  freebox_url,
  freebox_token,
  freebox_app_id,
  freebox_session_ttl
} = require("./conf");

const agent = new https.Agent({
  ca: fs.readFileSync("./ca.pem")
});

const fetch_api_info = async () => {
  const api_info_res = await fetch(freebox_url);
  return api_info_res.json();
};

const api_info_promise = fetch_api_info();

exports.fetch_api = async (api_path, options) => {
  const {
    api_domain,
    https_port,
    api_base_url,
    api_version
  } = await api_info_promise;
  const major_api_version = api_version.substring(0, 1);
  const api_url = `https://${api_domain}:${https_port}${api_base_url}v${major_api_version}/`;
  const response = await fetch(`${api_url}${api_path}`, {
    agent,
    method: "POST",
    ...options,
    body:
      options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body)
  });
  return response.json();
};

exports.create_session = async () => {
  console.log("[FREEBOX] New session");
  const response_challenge = await exports.fetch_api("login/", {
    method: "GET"
  });
  console.log("[FREEBOX] Challenge response", response_challenge);
  const { challenge } = response_challenge.result;
  const response_session = await exports.fetch_api("login/session/", {
    body: {
      app_id: freebox_app_id,
      password: HmacSHA1(challenge, freebox_token).toString()
    }
  });
  console.log("[FREEBOX] Session response", response_session);
  return response_session.result.session_token;
};
