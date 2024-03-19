process.title = "Tool Farm OwO by Eternityyy - Aiko-chan-ai"

import { Message, NewsChannel, TextChannel } from "discord.js-selfbot-v13"
import path from "node:path"
import os from "node:os"
import fs from "node:fs"

import { commandHandler, consoleNotify, ranInt, reloadPresence, send, sleep, solveCaptcha } from "./src/Extension.js"
import { Configuration, Tool } from "./src/lib/class.js"
import { main, selfbotNotify } from "./src/SelfbotWorker.js"
import { collectData } from "./src/DataCollector.js"
import { log } from "./src/Console.js"

export const global = {
    owoID: "408785106942164992",
    captchaDetected: false,
    paused: false,
    slashError: 0,
    totalcmd: 0,
    totaltxt: 0,
    prefix: ["owo"]
} as Tool

global.FolderPath = path.join(os.homedir(), "data")
global.DataPath = path.join(global.FolderPath, "data.json")

let Data = JSON.parse(
    fs.existsSync(global.DataPath) ? fs.readFileSync(global.DataPath, "utf-8") : "{}"
) as {[key:string]: Configuration}

if(!fs.existsSync(global.FolderPath)) {
    fs.mkdirSync(global.FolderPath)
    fs.writeFileSync(global.DataPath, "{}")
}

process.on("unhandledRejection", (error) => {
    console.error(error)
    log("Unhandled Rejection Found!", "PROMISE.ERROR")
})

process.on("SIGINT", async () => {
    await consoleNotify();
    process.exit(1);
});

/**
 *CopyRight © 2022 aiko-chan-ai x Eternity
 *From Vietnam with love
**/

(async () => {
    const { client, conf } = await collectData(Data)
    global.config = conf
    client.on("ready", async () => {
        log(`\x1b[94mLogged In As ${client.user?.displayName}`, "i")
        global.startTime = Date.now()
        reloadPresence(client)
        if(global.config.cmdPrefix) global.commands = await commandHandler()
        global.channel = client.channels.cache.get(global.config.channelID[0]) as TextChannel | NewsChannel
        main()
    }).on("messageCreate", async message => {
        if(message.author.id != global.owoID) return;
        if(!(
            message.channel.type == "DM" || 
            message.content.includes(message.client.user?.id!) ||
            message.content.includes(message.client.user?.username!) ||
            message.content.includes(message.client.user?.displayName!) ||
            message.content.includes(message.guild?.members.me?.displayName!)
        )) return;
        if(/are you a real human|(check|verify) that you are.{1,3}human!/img.test(message.content)) {
            log(`Captcha Found in Channel: #${message.channel.type == "DM" ? message.channel.recipient.displayName : message.channel.name}`)
            if(!global.config.autoResume && !global.config.captchaAPI) process.emit("SIGINT");
            global.captchaDetected = true;
            await consoleNotify();
            if(global.config.captchaAPI == 0) {
                await selfbotNotify(message)
                return log("WAITING FOR THE CAPTCHA TO BE RESOLVED TO RESTART...", "i")
            }

            try {
                if(message.attachments.first()) {
                    log("Captcha Image Found!", "i");
                    const imageUrl = message.attachments.first()?.url
                    if(!imageUrl) throw new Error("Could Not Retrieve Captcha Image URL")
                    const answer = await solveCaptcha(message.client, imageUrl) as string | undefined
                    if(!answer || /\d/.test(answer)) throw new Error(answer ? `Captcha Solving Returns Invalid Answer: ${answer}` : "Could Not Retrieve Captcha Answer")
                    const owo = message.client.users.cache.get(global.owoID)
                    if(!owo?.dmChannel) await owo?.createDM()
                    if(!owo || !owo.dmChannel) throw new Error("Could Not Reach OwO DM Channel")
                    owo.dmChannel.sendTyping()
                    await sleep(ranInt(3200, 12000));
                    await owo.send(answer)
                    const collector = owo.dmChannel.createMessageCollector({filter: (msg:Message<boolean>) => msg.author.id == global.owoID && /verified that you are.{1,3}human!/igm.test(msg.content), max: 1, time: 15_000})
                    collector.once("collect", () => selfbotNotify(message))
                    collector.once("end", (collection) => {if(Object.keys(collection).length == 0) throw new Error("Captcha Answer Sent but Got No Response")})
                } else if(/(https?:\/\/[^\s]+)/g.test(message.content)) {
                    log("HCaptcha Link Found!", "i")
                    throw new Error("Due to NoCaptchaAI's non-response, This Feature is Not Available Yet!")
                    await solveCaptcha(message.client)
                } else throw new Error("Captcha Message Found but Got No Image/Link")
                selfbotNotify(message)
            } catch (error) {
                if(error) log(`${error}`, "e")
                log("Attempt To Solve Captcha Failed", "a")
                log("WAITING FOR THE CAPTCHA TO BE RESOLVED TO RESTART...", "i")
                selfbotNotify(message, true)
            }
        }

        else if(/verified that you are.{1,3}human!/igm.test(message.content)) {
            log(`CAPTCHA HAS BEEN RESOLVED, ${global.config.autoResume ? "RESTARTING SELFBOT" : "STOPPING SELFBOT"}...`, "i");
            if(!global.config.autoResume) process.exit(1);
            global.captchaDetected = false
            main()
        }

        else if(/have been banned/.test(message.content)) {
            log("ACCOUNT HAS BEEN BANNED, STOPPING SELFBOT...", "e")
            process.emit("SIGINT")
        }

        else if(message.content.includes("You don't have enough cowoncy!")) {
            if(global.config.autoSell) await send("sell all")
            else {
                log("Cowoncy Ran Out, Stopping Selfbot", "a")
                process.emit("SIGINT")
            }
        }
    }).on("messageCreate", async (message) => {
        if(!global.captchaDetected) return;
        if(!global.config.userNotify || message.author.id !== global.config.userNotify) return;
        if(message.channel.type !== "DM" || message.channel.recipient.id !== global.config.userNotify || !global.captchaDetected) return;
        if(/^[a-zA-Z]{3,6}$/.test(message.content)) {
            const msg = message
            let filter = (m:Message<boolean>) => m.author.id === global.owoID && m.channel.type == 'DM' && /(wrong verification code!)|(verified that you are.{1,3}human!)|(have been banned)/gim.test(m.content)
            try {
                const owo = msg.client.users.cache.get(global.owoID)
                if (!owo?.dmChannel) await owo?.createDM();
                if(!owo || !owo.dmChannel) throw new Error("Could Not Reach OwO DM Channel");
                await owo.send(msg.content)
                const collector = owo.dmChannel.createMessageCollector({filter, max: 1, time: 15_000})
                collector.once("collect", (m) => {console.log(msg.content); msg.reply(m.content)})
            } catch (error) {
                log(`${error}`, "e")
                msg.reply(`${error}`)
            }
        } else if(!(global.config.cmdPrefix && message.content.startsWith(global.config.cmdPrefix))) message.reply("Wrong syntax, this message will not be sent to OwO Bot!")
    }).on("messageCreate", async (message) => {
        if(!global.config.cmdPrefix || global.config.cmdPrefix.length === 0) return;
        if(message.content.startsWith(global.config.cmdPrefix) && (message.author.id == global.config.userNotify || message.author.id == message.client.user?.id)) {
            const args = message.content.slice(global.config.cmdPrefix.length).split(/ +/)
            const commandName = args.shift()?.toLowerCase()
            if(!commandName || !global.commands[commandName]) return;
            try {
                message.channel.sendTyping()
                await sleep(ranInt(180, 300));
                await global.commands[commandName].callback(message, ...args)
            } catch (error) {
                console.log(error)
                log("An Error Occurs While Trying To Perform Command", "e")
            }
        }
    })
    client.emit("ready", client)
})()