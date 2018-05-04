const { dirname } = require("path");
const FormData = require("form-data");
const cron = require("node-cron");

const { connect, list } = require("./ftp");
const { load, write } = require("./db");
const { create_session, fetch_api } = require("./freebox");
const {
  server_url,
  server_context,
  server_username,
  server_password,
  freebox_token_header,
  server_download_quantity
} = require("./conf");

const formData = content => {
  const form = new FormData();
  for (name in content) {
    form.append(name, content[name]);
  }
  return form;
};

const run = async () => {
  try {
    const client = await connect();
    const listing = (await list(client, server_context)).map(file =>
      file.substring(server_context.length + 1)
    );
    const data = await load();
    const token = await create_session();
    const downloads_response = await fetch_api("downloads/", {
      method: "GET",
      headers: { [freebox_token_header]: token }
    });
    const downloads = downloads_response.result || [];

    downloads.forEach(download => {
      download.download_dir = Buffer.from(
        download.download_dir,
        "base64"
      ).toString();
    });

    // Remove finished
    for (let download of downloads) {
      if (download.status === "done") {
        const response = await fetch_api(`downloads/${download.id}`, {
          method: "DELETE",
          headers: { [freebox_token_header]: token }
        });
        console.log("Delete Freebox download", download.name, response);
      }
    }

    const toDownload = listing
      .filter(file => !data.includes(file))
      .filter((_, index) => index < server_download_quantity);

    // Add new
    for (let download of toDownload) {
      const download_url = `ftp://${server_url}${server_context}/${download}`;
      const download_dir = new Buffer(
        `/Disque dur/Téléchargements/${dirname(download)}`
      ).toString("base64");
      const response = await fetch_api("downloads/add", {
        method: "POST",
        headers: { [freebox_token_header]: token },
        body: formData({
          download_url,
          download_dir,
          username: server_username,
          password: server_password
        })
      });
      console.log("Add Freebox download", download_url, download_dir, response);
      data.push(download);
    }

    await write(data);
    client.close();
  } catch (err) {
    console.log(err);
  }
};

cron.schedule("* * * * *", run, true);
