const { readFile, writeFile } = require("fs-extra");

const { db_file } = require("./conf");

exports.load = async () => {
  try {
    return JSON.parse(await readFile(db_file));
  } catch (error) {
    return [];
  }
};

exports.write = async data => {
  await writeFile(db_file, JSON.stringify(data, null, 2));
};
