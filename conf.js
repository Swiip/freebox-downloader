module.exports = {
  freebox_url: "http://mafreebox.freebox.fr/api_version",
  freebox_app_id: "freebox-downloader",
  freebox_token: process.env.FREEBOX_TOKEN,
  freebox_token_header: "X-Fbx-App-Auth",
  freebox_session_ttl: 1000 * 60 * 10,
  server_url: process.env.SERVER_URL,
  server_username: process.env.SERVER_USERNAME,
  server_password: process.env.SERVER_PASSWORD,
  server_context: process.env.SERVER_CONTEXT,
  server_check_frequency: 1000 * 60,
  server_download_quantity: 20,
  db_file: "./db.json"
};
