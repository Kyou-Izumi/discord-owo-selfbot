process.title = "Tool Farm OwO by Eternity_VN - aiko-chan-ai"

//import libraries

import * as discord from "discord.js-selfbot-v13"
import path from "path"
import fs from "fs"
import os from "os"

//import files

import { collectData } from "./lib/DataCollector.js"
import { log } from "./lib/console.js"
import { solveCaptcha } from "./lib/extension.js"
import { main, notify } from "./lib/SelfbotWorker.js"

//define variables
export const FolderPath = path.join(os.homedir(), "data")
export const DataPath = path.resolve(FolderPath, "./data.json")
const LangPath = path.resolve(FolderPath, "./language.json")
let Data = JSON.parse(fs.existsSync(DataPath) ? fs.readFileSync(DataPath) : "{}")

//global variables
export var global = {}
global.owoID = "408785106942164992";
global.channel, global.config, global.language, global.totalcmd = 0, global.totaltext = 0, global.timer = 0;;
global.callingUser = false, global.captchaDetected = false;

//check data

if(!fs.existsSync(FolderPath)) {
    fs.mkdirSync(FolderPath)
    fs.writeFileSync(DataPath, "{}")
}

//Process Error Handler

process.on('unhandledRejection', (err) => {
    log(err, "PROMISE.ERROR")
});

process.on("SIGINT", async function () {
    console.log("\n")
    console.log("\x1b[92mTotal command sent: \x1b[0m" + global.totalcmd)
    console.log("\x1b[92mTotal text sent: \x1b[0m" + global.totaltext)
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
    global.config = conf;
    client
    .on("ready", () => {
        log("\x1b[94mLogged In As " + client.user.tag, "i")
        const activity = new discord.RichPresence()
            .setApplicationId("817229550684471297")
            .setType("PLAYING")
            .setName("OwO BOT")
            .setDetails("Working Hard As F#%$CK For Its Owner")
            .setStartTimestamp(Date.now())
            .setAssetsLargeImage("994584553857499146")
            .setAssetsLargeText("OwO")
            .addButton('Github', "https://github.com/LongAKolangle/discord-owo-selfbot")
            .addButton('Youtube', "https://youtube.com/@EternityNqu")
        client.user.setActivity(activity.toJSON())
        global.channel = client.channels.cache.get(global.config.channelID[0])
        main()
    })

    .on("messageCreate", async (message) => {
        if(message.author.id == global.owoID) {
            if((message.content.includes(message.client.user.username) && message.content.match(/(check|verify) that you are.{1,3}human!/igm)) || (message.content.includes('Beep Boop') && message.channel.type == 'DM')) {
                global.captchaDetected = true
                console.log("\n")
                console.log("\x1b[92mTotal command sent: \x1b[0m" + global.totalcmd)
                console.log("\x1b[92mTotal text sent: \x1b[0m" + global.totaltext)
                console.log("\x1b[36mSELFBOT HAS BEEN TERMINATED!\x1b[0m")

                if(!global.config.autoWait && !global.config.captchaAPI) process.exit(1)

                else if(global.config.captchaAPI) {
                    if(message.attachments) {
                        try {
                            var attempt = await solveCaptcha(message.attachments.first().url)
                            if(!attempt || attempt.match(/\d/)) throw new Error()
                            const owo = message.client.users.cache.get(global.owoID)
                            if(!owo.dmChannel) owo.createDM()
                            await owo.send(attempt)
                            const filter = m => m.author.id == global.owoID
                            const collector = owo.dmChannel.createMessageCollector({filter, max: 1, time: 15_000})
                            collector.on("collect", msg => {
                                if (msg.content.match(/verified that you are.{1,3}human!/igm)) return notify(message, true)
                                return notify(message)
                            })
                        } catch (error) {
                            log("Attempt To Solve Captcha Failed", "e")
                            return notify(message)
                        }
                    }
                    else log("No Captcha Image Found!", "i")
                }
                else log("WAITING FOR THE CAPTCHA TO BE RESOLVED TO RESTART...", "i")
            }

            else if(message.content.match(/verified that you are.{1,3}human!/igm) && message.channel.type == 'DM') {
                log("CAPTCHA HAS BEEN RESOLVED, RESTARTING SELFBOT...", "i")
                global.captchaDetected = false
                main()
            }

            else if((message.content.match(/have been banned/igm) && message.channel.type == 'DM') || (message.content.includes(message.client.user.username) && message.content.match(/have been banned/igm))) {
                log("ACCOUNT HAS BEEN BANNED, STOPPING SELFBOT...", "e")
                console.log("\n");
                console.log("\x1b[92mTotal command sent: \x1b[0m" + global.totalcmd);
                console.log("\x1b[92mTotal text sent: \x1b[0m" + global.totaltext);
                console.log("\x1b[36mSELFBOT HAS BEEN TERMINATED!\x1b[0m");
                process.exit(1);
            }
        }
        if(global.captchaDetected && message.author.id == global.config.userNotify && message.channel.type == "DM") {
            if(message.content.match(/^\s{3,6}$/)) {
                let filter = m => m.author.id === owobot && m.channel.type == 'DM' && m.content.match(/(wrong verification code!)|(verified that you are.{1,3}human!)|(have been banned)/gim)
                try {
                    const owo = message.client.users.cache.get(global.owoID)
                    if(!owo.dmChannel) owo.createDM()
                    await owo.send(message.content)
                    const collector = owo.dmChannel.createMessageCollector({filter, max: 1, time: 15_000})
                    collector.on("collect", msg => {
                        message.reply(msg.content)
                    })
                } catch (error) {
                    message.reply("An Error Occurred, Please Check The Account Yourself")
                }
            }
            else {
                return message.reply("Wrong syntax, this message will not be sent to OwO Bot!")
            }
        }
    })

    .on("callUpdate", (_ID, _region, userRinging) => {
        if(global.callingUser && userRinging.length === 0) {
            global.callingUser = false
            client.callVoice.destroy()
        }
    })

    client.emit("ready")
})()