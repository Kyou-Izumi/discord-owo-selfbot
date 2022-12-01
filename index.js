process.title = "Tool Farm OwO by Eternity_VN - aiko-chan-ai"
//import libraries
import * as discord from "discord.js-selfbot-v13"
import path from "path"
import fs from "fs"
//import files
import { getResult } from "./lib/extension";
//define variables
const FolderPath = path.resolve(__dirname, "./data")
const DataPath = path.resolve(FolderPath, "./data.json")
const owoID = "408785106942164992"
var client;
let RawData = JSON.parse(fs.existsSync(DataPath) ? fs.readFileSync(DataPath) : "{}")
let language = RawData[0], data = RawData[1]
//check data
if(fs.existsSync(FolderPath)) {
    fs.mkdirSync(FolderPath)
    fs.writeFileSync(DataPath, "{}")
}

//Process Error Handler
process.on('unhandledRejection', (err) => {
    log("PROMISE.ERROR", err)
});

process.on("SIGINT", async function () {
    console.log("\x1b[92mTotal command sent: \x1b[0m" + totalcmd)
    console.log("\x1b[92mTotal text sent: \x1b[0m" + totaltext)
    process.exit(1)
});
//let the code begins

/**
 *CopyRight © 2022 aiko-chan-ai x Eternity
 *From Vietnam with love
**/
