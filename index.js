process.title = "Tool Farm OwO by Eternity_VN - aiko-chan-ai"

//import libraries

import path from "path"
import fs from "fs"
import os from "os"

//import files

import { collectData } from "./lib/DataCollector.js"
import { log } from "./lib/console.js"
import { commandHandler, randomInt, reloadPresence, sleep, solveCaptcha, timeHandler } from "./lib/extension.js"
import { main, notify } from "./lib/SelfbotWorker.js"

//define variables
export const FolderPath = path.join(os.homedir(), "data")
export const DataPath = path.resolve(FolderPath, "./data.json")
const LangPath = path.resolve(FolderPath, "./language.json")
let Data = JSON.parse(fs.existsSync(DataPath) ? fs.readFileSync(DataPath) : "{}")

//global variables
export var global = {}
global.commands = {}
global.owoID = "408785106942164992";
global.channel, global.config, global.language, global.totalcmd = 0, global.totaltext = 0, global.timer = 0;
global.callingUser = false, global.captchaDetected = false, global.paused = false, global.lastTime = 0;

//check data

if(!fs.existsSync(FolderPath)) {
    fs.mkdirSync(FolderPath)
    fs.writeFileSync(DataPath, "{}")
}

//Process Error Handler

process.on('unhandledRejection', (err) => {
    console.log(err);
    log(err, "PROMISE.ERROR")
});

process.on("SIGINT", function () {
    console.log("\n")
    console.log("\x1b[92mTotal command sent: \x1b[0m" + global.totalcmd)
    console.log("\x1b[92mTotal text sent: \x1b[0m" + global.totaltext)
    console.log("\x1b[92mTotal active time: \x1b[0m" + timeHandler(global.startTime, Date.now()))
    console.log("\x1b[36mSELFBOT HAS BEEN TERMINATED!\x1b[0m")
    process.exit(1)
});

/**
 *CopyRight © 2022 aiko-chan-ai x Eternity
 *From Vietnam with love
**/

(async () => {
    const { client, conf } = await collectData(Data, DataPath);
    global.config = conf;
    client
    .on("ready", async () => {
        log("\x1b[94mLogged In As " + client.user.tag, "i")
        global.startTime = new Date();
        reloadPresence(client);
        if(global.config.cmdPrefix) await commandHandler()
        global.channel = client.channels.cache.get(global.config.channelID[0]);
        main();
    })
    .on("shardReady", () => reloadPresence(client))
    .on("messageCreate", async (message) => {
        if(message.author.id == global.owoID) {
            if((message.content.includes(message.client.user.username) && message.content.match(/(check|verify) that you are.{1,3}human!/igm)) || (message.content.includes('Beep Boop') && message.channel.type == 'DM')) {
                global.captchaDetected = true;
                console.log("\n");
                console.log("\x1b[92mTotal command sent: \x1b[0m" + global.totalcmd);
                console.log("\x1b[92mTotal text sent: \x1b[0m" + global.totaltext);
                console.log("\x1b[92mTotal active time: \x1b[0m" + timeHandler(global.startTime, Date.now()));
                console.log("\x1b[36mSELFBOT HAS BEEN TERMINATED!\x1b[0m");

                if(!global.config.autoWait && !global.config.captchaAPI) process.exit(1);

                else if([1, 2].includes(global.config.captchaAPI)) {
                    if(message.attachments) {
                        try {
                            var attempt = await solveCaptcha(message.attachments.first().url);
                            if(!attempt || attempt.match(/\d/)) {
                                log("Captcha Solving System returns: " + attempt, "i");
                                throw new Error();
                            }
                            const owo = message.client.users.cache.get(global.owoID);
                            if(!owo.dmChannel) owo.createDM();
                            await sleep(randomInt(4000, 12000));
                            await owo.send(attempt);
                            const filter = m => m.author.id == global.owoID;
                            const collector = owo.dmChannel.createMessageCollector({filter, max: 1, time: 15_000});
                            collector.on("collect", async msg => {
                                if (msg.content.match(/verified that you are.{1,3}human!/igm)) return await notify(message, true);
                                return await notify(message);
                            })
                        } catch (error) {
                            log("Attempt To Solve Captcha Failed", "e")
                            console.log(error);
                            return await notify(message)
                        }
                    }
                    else log("No Captcha Image Found!", "i")
                }
                else log("WAITING FOR THE CAPTCHA TO BE RESOLVED TO RESTART...", "i")
            }

            else if(message.content.match(/verified that you are.{1,3}human!/igm) && message.channel.type == 'DM') {
                log("CAPTCHA HAS BEEN RESOLVED, RESTARTING SELFBOT...", "i");
                global.captchaDetected = false;
                main();
            }

            else if((message.content.match(/have been banned/igm) && message.channel.type == 'DM') || (message.content.includes(message.client.user.username) && message.content.match(/have been banned/igm))) {
                log("ACCOUNT HAS BEEN BANNED, STOPPING SELFBOT...", "e")
                console.log("\n");
                console.log("\x1b[92mTotal command sent: \x1b[0m" + global.totalcmd);
                console.log("\x1b[92mTotal text sent: \x1b[0m" + global.totaltext);
                console.log("\x1b[92mTotal active time: \x1b[0m" + timeHandler(global.startTime, Date.now()));
                console.log("\x1b[36mSELFBOT HAS BEEN TERMINATED!\x1b[0m");
                process.exit(1);
            }
        }
        if(message.author.id == global.config.userNotify) {
            let msgr = message
            if(message.channel.type == "DM" && global.captchaDetected && message.channel.recipient.id === global.config.userNotify) {
                if(message.content.match(/^[a-zA-Z]{3,6}$/)) {
                    let filter = m => m.author.id === global.owoID && m.channel.type == 'DM' && m.content.match(/(wrong verification code!)|(verified that you are.{1,3}human!)|(have been banned)/gim)
                    try {
                        const owo = message.client.users.cache.get(global.owoID)
                        if(!owo.dmChannel) owo.createDM()
                        await owo.send(message.content)
                        const collector = owo.dmChannel.createMessageCollector({filter, max: 1, time: 15_000})
                        collector.on("collect", msg => {
                            console.log(msg.content);
                            msgr.reply(msg.content)
                        })
                    } catch (error) {
                        msgr.reply("An Error Occurred, Please Check The Account Yourself")
                    }
                } else {
                    return msgr.reply("Wrong syntax, this message will not be sent to OwO Bot!")
                }
            } 
            if(global.config.cmdPrefix) {
                if(!message.content.startsWith(global.config.cmdPrefix)) return;
                const args = message.content.slice(global.config.cmdPrefix.length).split(/ +/)
                const commandName = args.shift().toLowerCase()
                if(!global.commands[commandName]) return;
                try {
                    message.channel.sendTyping();
                    await sleep(randomInt(680, 3400));
                    await global.commands[commandName].callback(message, ...args)
                } catch (error) {
                    log("An Error Occurs While Trying To Perform Command", "e")
                    console.log(error);
                }
            }
        } 
    })

    .on('callUpdate', async (call, oldCall) => {
        if (global.callingUser) {
            if (call.ringing && !oldCall.ringing) {
                global.timeoutId = setTimeout(async () => {
                    await call.stop();
                    global.callingUser = false
                }, 30000);
            } else if (!call.ringing && oldCall.ringing) {
                if (global.timeoutId) {
                    clearTimeout(timeoutId);
                    global.timeoutId = null;
                }
                if (call.channel.members.size <= 1) {
                    await call.leave();
                } else {
                    await call.stop();
                }
                global.callingUser = false;
            }
        }
    });

    client.emit("ready")
})()