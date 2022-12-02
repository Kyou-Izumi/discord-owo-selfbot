process.title = "Tool Farm OwO by Eternity_VN - aiko-chan-ai"

//import libraries

import * as discord from "discord.js-selfbot-v13"
import path from "path"
import fs from "fs"
import url from "url"

//import files

import { collectData } from "./src/DataCollector.js"
import { log } from "./lib/console.js"

//define variables

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const FolderPath = path.resolve(__dirname, "./data")
const DataPath = path.resolve(FolderPath, "./data.json")
const LangPath = path.resolve(FolderPath, "./language.json")
let Data = JSON.parse(fs.existsSync(DataPath) ? fs.readFileSync(DataPath) : "{}")

//global variables

export const owoID = "408785106942164992";
export var channel, config, language, totalcmd = 0, totaltext = 0;

//check data

if(!fs.existsSync(FolderPath)) {
    fs.mkdirSync(FolderPath)
    fs.writeFileSync(DataPath, "{}")
}

//Process Error Handler
// process.on('unhandledRejection', (err) => {
//     log(err, "PROMISE.ERROR")
// });

process.on("SIGINT", async function () {
    console.log("\n")
    console.log("\x1b[92mTotal command sent: \x1b[0m" + totalcmd)
    console.log("\x1b[92mTotal text sent: \x1b[0m" + totaltext)
    console.log("\x1b[36mSELFBOT HAS BEEN TERMINATED!\x1b[0m")
    process.exit(1)
});

//let the show begins

/**
 *CopyRight © 2022 aiko-chan-ai x Eternity
 *From Vietnam with love
**/
(async () => {
    const { client, conf } = await collectData(Data, DataPath);
    config = conf;
    client.on("ready", () => {
        log("\x1b[94mLogged In As " + client.user.tag, "i")
        const activity = new discord.RichPresence()
            .setApplicationId("817229550684471297")
            .setType("PLAYING")
            .setName("OwO BOT")
            .setDetails("Working Hard As F#%$CK For Its Owner")
            .setStartTimestamp(Data.now())
            .setAssetsLargeImage("994584553857499146")
            .setAssetsLargeText("OwO")
            .addButton('Github', "https://github.com/LongAKolangle/discord-owo-selfbot")
            .addButton('Youtube', "https://youtube.com/@EternityNqu")
        client.user.setActivity(activity.toJSON())
        channel = client.channels.cache.get(config.channelID[0])
    });

    client.on("messageCreate", async (message) => {

    })
    client.emit("ready")
})()