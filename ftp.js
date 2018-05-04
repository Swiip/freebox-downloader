const { Client } = require("basic-ftp");

const {
  server_url,
  server_username,
  server_password,
  server_context,
  server_check_frequency
} = require("./conf");

exports.connect = async () => {
  const client = new Client();
  await client.connect(server_url, 21);
  console.log("[FTP] connected");
  await client.useTLS();
  console.log("[FTP] TLS activated");
  await client.login(server_username, server_password);
  console.log("[FTP] logged");
  await client.useDefaultSettings();
  console.log("[FTP] set up");
  return client;
};

exports.list = async (client, context) => {
  let result = [];
  await client.cd(context);
  console.log("[FTP] list", context);
  const content = await client.list();
  for (let entry of content) {
    if (entry.type === 0) {
      result.push(`${context}/${entry.name}`);
    } else {
      const folder_content = await exports.list(
        client,
        `${context}/${entry.name}`
      );
      result.push(...folder_content);
    }
  }
  return result;
};
