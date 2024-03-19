import fs from "node:fs";
import { spawn } from "node:child_process";

import { mapInt, ranInt, send, shuffleArray, sleep, solveCaptcha, timeHandler } from "./Extension.js";
import { global } from "../index.js";
import { Configuration } from "./lib/class.js";
import { log } from "./Console.js";
import { Message, MessageAttachment, MessageEmbed, NewsChannel, TextChannel, WebhookClient } from "discord.js-selfbot-v13";
import axios from "axios";
import { quotes } from "./lib/data.js";

let timeoutChannel = ranInt(17, 51), timeoutShift = ranInt(38, 92), timeoutOther:number, timeoutPray:number,
timeoutSleep = mapInt(timeoutShift, 38, 92, 160_000, 1_275_000), timeoutDelay = ranInt(15000, 22000), timeoutHuntbot:number
let ordinary = ["hunt", "battle", "hunt", "battle", "hunt"], other = ["run", "pup", "piku"],
box = false, inv:string[], gem1:number[] | undefined, gem2:number[] | undefined, gem3:number[] | undefined
const traits = ["Efficiency", "Duration", "Cost", "Gain", "Experience", "Radar"]

export const aReload = (force = false) => {
    if(!global.reloadTime) {global.reloadTime = new Date().setUTCHours(24, ranInt(0, 5), ranInt(0, 55));return;}
    if(global.startTime > global.reloadTime) global.reloadTime = new Date(global.reloadTime).setDate(new Date(global.reloadTime).getDate() + 1)
    try {
        gem1 = undefined
        gem2 = undefined
        gem3 = undefined
        if(Date.now() >= global.reloadTime) global.reloadTime = new Date(global.reloadTime).setDate(new Date(global.reloadTime).getDate() + 1)
        global.config = JSON.parse(fs.readFileSync(global.DataPath, "utf-8"))[`${global.channel.client.user?.id}`] as Configuration
        log("Configuration Reloaded Successfully", "i")
        if(force) return true
    } catch (error) {
        console.log(error)
        log("Failed To Reload The Configuration", "e")
        if(force) return false
    }
}

const aDaily = async () => {
    await send("daily")
    global.config.autoDaily = false
}

const aPray = async () => {
    timeoutPray = new Date().setMinutes(new Date().getMinutes() + 5)
    const cmd = global.config.autoPray[ranInt(0, global.config.autoPray.length)]
    await send(cmd)
}

const aChannel = async () => {
    let arr = global.config.channelID.filter(id => global.channel.id != id)
    global.channel = global.channel.client.channels.cache.get(arr[ranInt(0, arr.length)]) as TextChannel | NewsChannel
    log(`Channel Changed To: #${global.channel.name}`, "i")
    timeoutChannel += ranInt(17, 51)
}

const aSleep = async () => {
    log(`Selfbot is Taking A Break For ${timeHandler(0, timeoutSleep, true)}`, "i")
    await sleep(timeoutSleep)
    const nextShift = ranInt(38, 92)
    timeoutShift += nextShift
    timeoutSleep = mapInt(nextShift, 38, 92, 160_000, 1_275_000)
}

const aOther = async () => {
    const cmd = other[ranInt(0, other.length)]
    await send(cmd)
    const filter = (m:Message<boolean>) => m.author.id == global.owoID && (m.content.startsWith("🚫 **|** ") || m.content.startsWith(":no_entry_sign: **|** "))
    const collector = global.channel.createMessageCollector({filter, max: 1, time: 10_000})
    collector.once("collect", (msg) => {
        if(other.indexOf(cmd) > -1) other.splice(other.indexOf(cmd), 1)
        if(other.length < 1) global.config.autoOther = false
    })
}

const aQuote = async () => {
    switch (ranInt(0, 3)) {
        case 1:
        case 2:
            const quote = quotes[ranInt(0, quotes.length)]
            if(quote) {
                await send(quote, "quote")
                break;
            } else log("Could Not Retrieve Quote From Local Storage, Sending owo/uwu Instead", "e")
        default:
            await send(["owo", "uwu"][ranInt(0, 2)], "quote")
            break;
    }
}

const aHuntbot = async () => {
    const cmd = ["huntbot", "autohunt", "hb", "ah"]
    await send(cmd[ranInt(0, cmd.length)])
    const collector = global.channel.createMessageCollector({
        filter: msg => msg.author.id == global.owoID && msg.embeds[0] && msg.embeds[0].author !== null && msg.embeds[0].author.name.includes(msg.guild?.members.me?.displayName!) && msg.embeds[0].author.name.includes("HuntBot"), 
        max: 1, time: 15_000
    })
    collector.once('collect', async (message) => {
        if(timeoutHuntbot && Date.now() < timeoutHuntbot) return;
        const embed = message.embeds[0]
        const lastFields = embed.fields.slice(-2)
        if(global.config.upgradeTrait) {
            const trait = embed.fields[global.config.upgradeTrait].value
            const arr = trait.match(/\[(\d+)\/(\d+)\]`/)
            const essence = (lastFields[0].name.match(/Animal Essence - `(\d+)`/i) ?? lastFields[1].name.match(/Animal Essence - `(\d+)`/i))?.[1].replace(/,/g, "")
            if(!arr) {
                global.config.upgradeTrait = undefined
                return log("Trait Max Level Reached, Auto Upgrade Trait has been Disabled", "i")
            }
            if(!essence) log("Could Not Retrieve Essence Balance", "e")
            else if(Number(essence) === 0) log("Insufficient Essence, Auto Upgrade Trait has been Skipped", "i")
            else {
                const upgradeArr = [
                    "all",
                    ...(Number(essence) > Number(arr[2]) - Number(arr[1]) ? [`${Number(arr[2]) - Number(arr[1])}`, "lvl", "level"] : [])
                ]
                await send(`upgrade ${traits[global.config.upgradeTrait]} ${upgradeArr[ranInt(0, upgradeArr.length)]}`)
            }
        }
        if(lastFields[1].name.includes("HUNTBOT is currently hunting!")) {
            timeoutHuntbot = new Date().setHours(
                new Date().getHours() + Number(lastFields[1].value.match(/I WILL BE BACK IN (\d+)H/i)?.[1] ?? 0),
                new Date().getMinutes() + Number(lastFields[1].value.match(/ (\d+)M`/i)?.[1] ?? 0) + 1, ranInt(0, 60)
            )
            return;
        }
        send(`${cmd[ranInt(0, cmd.length)]} 24h`)
        global.channel.createMessageCollector({
            filter: (msg) => msg.author.id == global.owoID && ((msg.content.includes(msg.guild?.members.me?.displayName!) 
            && ((msg.attachments.first() != undefined && msg.content.includes("Here is your password!")) || msg.content.includes("Please include your password!")))),
            max: 1, time: 15_000
        }).once("collect", async (msg) => {
            try {
                if(timeoutHuntbot && Date.now() < timeoutHuntbot) return;
                if(msg.content.includes("Please include your password!")) {
                    timeoutHuntbot = new Date().setMinutes(new Date().getMinutes() + Number(msg.content.match(/Password will reset in (\d+) minute/)?.[1] ?? 10))
                    log(`Huntbot Will Arrive/Re-check in: ${timeHandler(Date.now(), timeoutHuntbot)}`, "i")
                    return;
                }
                const answer = await solveCaptcha(msg.client, msg.attachments.first()?.url) as string | undefined
                if(!answer || !/^\w{5}$/.test(answer)) {
                    timeoutHuntbot = new Date().setMinutes(new Date().getMinutes() + 10, new Date().getMinutes() + ranInt(10, 50))
                    throw new Error(answer ? `Huntbot Captcha Solving Returns Invalid Answer: ${answer}` : "Could Not Retrieve Huntbot Captcha Answer")
                }
                send(`${cmd[ranInt(0, cmd.length)]} 24h ${answer}`)
                global.channel.createMessageCollector({
                    filter: (m) => m.author.id == global.owoID && m.content.includes(m.guild?.members.me?.displayName!) &&
                    (/I WILL BE BACK IN (\d+H)?\d+M/gmi.test(m.content) || /Password will reset in/.test(m.content))
                }).once("collect", m => {
                    if(timeoutHuntbot && Date.now() < timeoutHuntbot) return;
                    if(/Password will reset in \d+ minute/.test(m.content)) timeoutHuntbot = new Date().setMinutes(new Date().getMinutes() + 10, new Date().getMinutes() + ranInt(10, 50))
                    else timeoutHuntbot = new Date().setHours(
                        new Date().getHours() + Number(m.content.match(/I WILL BE BACK IN (\d+)H/i)?.[1] ?? 0),
                        new Date().getMinutes() + Number(m.content.match(/ (\d+)M/i)?.[1] ?? 0) + 1, ranInt(0, 60)
                    )
                    log(`Huntbot Will Arrive/Re-check in: ${timeHandler(Date.now(), timeoutHuntbot)}`, "i")
                })
            } catch (error) {
                log(`${error}`, "e")
            }
        })
    })
}

const aGamble = async () => {
    const bjHandler = async (message:Message) => {
        try {
            sleep(ranInt(600, 1200))
            const card = message.embeds[0].fields[1].name.match(/`\[(\d+)\]\*?`/)
            if(!card) throw new Error("Could Not Retrieve Blackjack Cards")
            if(message.embeds[0].color != 8240363) return;
            if(Number(card[1]) < 15) {
                await message.react("👊")
            } else if(Number(card[1]) >= 15 && Number(card[1]) < 19) {
                ranInt(0, 4) == 0 ? await message.react("🛑") : await message.react("👊")
            } else if(Number(card[1]) >= 19 && Number(card[1]) <= 21) {
                await message.react("🛑")
            } else return;
            const msg = await global.channel.messages.fetch(message.id)
            await bjHandler(msg)
        } catch (error) {
            log(`${error}`, "e")
        }
    }

    const cmd = global.config.autoGamble[ranInt(0, global.config.autoGamble.length)]
    switch (cmd) {
        case "Slots":
            send(`${cmd} ${global.config.gamblingAmount}`.toLowerCase())
            break;
        case "Coinflip":
            send(`${cmd} ${["h", "t"][ranInt(0, 2)]} ${global.config.gamblingAmount}`.toLowerCase())
            break;
        case "Blackjack":
            send(`${cmd} ${global.config.gamblingAmount}`.toLowerCase())
            global.channel.createMessageCollector({
                filter: (m) => m.author.id == global.owoID && m.embeds[0] && m.embeds[0].author != null && m.embeds[0].author.name.includes(m.client.user?.username!)
                && m.embeds[0].author.name.includes("blackjack"),
                max: 1, time: 15_000
            }).once("collect", async (msg) => {await sleep(ranInt(2000, 3000)); await bjHandler(msg)})
    }
}

const aGem = async (useGem1:boolean, useGem2:boolean, useGem3:boolean) => {
    await send("inv")
    const filter = (msg:Message<boolean>) => msg.author.id == global.owoID && msg.content.includes(msg.guild?.members.me?.displayName!) && /Inventory/.test(msg.content)
    const collector = global.channel.createMessageCollector({filter, max: 1, time: 15_000})
    collector.once("collect", async (msg) => {
        inv = msg.content.split("`")
        gem1 = inv.filter(elm => /^05[1-7]$/.test(elm)).map(Number)
        gem2 = inv.filter(elm => /^(06[5-9]|07[0-1])$/.test(elm)).map(Number)
        gem3 = inv.filter(elm => /^07[2-8]$/.test(elm)).map(Number)
        box = global.config.autoCrate != undefined && inv.includes("050")
        if(box) {
            await send("lootbox all")
            await sleep(ranInt(4800, 6200))
            return aGem(useGem1, useGem2, useGem3)
        }
        let gem = [...gem1, ...gem2, ...gem3].length
        log(`Found ${gem} Hunting ${gem > 1 ? "Gems" : "Gem"} in Inventory`, "i")
        if(gem <= 0 && !box) {global.config.autoGem = -1; return;}
        let ugem1 = (useGem1 && gem1.length > 0) ? global.config.autoGem === 0 ? Math.max(...gem1) : Math.min(...gem1) : undefined
        let ugem2 = (useGem2 && gem2.length > 0) ? global.config.autoGem === 0 ? Math.max(...gem2) : Math.min(...gem2) : undefined
        let ugem3 = (useGem3 && gem3.length > 0) ? global.config.autoGem === 0 ? Math.max(...gem3) : Math.min(...gem3) : undefined
        if(!ugem1 && !ugem2 && !ugem3) return;
        await send(`use ${ugem1 ?? ""} ${ugem2 ?? ""} ${ugem3 ?? ""}`.replace(/\s+/g, " "))
    })
}

export const main = async () => {
    if(global.captchaDetected) return;
    if(global.lastTime && Date.now() - global.lastTime < 15_000) return;
    const cmd = ordinary[ranInt(0, ordinary.length)]
    await send(cmd, (global.config.autoSlash && ranInt(0, 4) === 3) ? "slashCommand" : "normalCommand")
    global.lastTime = Date.now()
    if((cmd.includes("hunt") || cmd.endsWith("h")) && global.config.autoGem >= 0) {
        const filter = (msg:Message<boolean>) => msg.author.id == global.owoID && msg.content.includes(msg.guild?.members.me?.displayName!) && /hunt is empowered by| spent 5 .+ and caught a/.test(msg.content)
        const collector = global.channel.createMessageCollector({filter, max: 1, time: 10_000})
        collector.on("collect", async (msg) => {
            let param1:boolean, param2:boolean, param3:boolean
            param1 = !msg.content.includes("gem1") && (!gem1 || gem1.length > 0)
            param2 = !msg.content.includes("gem3") && (!gem2 || gem2.length > 0)
            param3 = !msg.content.includes("gem4") && (!gem3 || gem3.length > 0)
            if(param1 || param2 || param3) await aGem(param1, param2, param3)
        })        
    }
    const commands = [
        {condition: global.config.autoPray.length > 0 && (!timeoutPray || Date.now() - timeoutPray >= 360_000), action: aPray},
        {condition: global.config.autoDaily, action: aDaily},
        {condition: global.config.autoHunt && (!timeoutHuntbot || Date.now() >= timeoutHuntbot), action: aHuntbot},
        {condition: global.config.autoOther && (!timeoutOther || Date.now() - timeoutOther >= 60_000), action: aOther},
        {condition: global.config.autoGamble.length > 0 && ranInt(0, 3) === 0, action: aGamble},
        {condition: global.config.autoSleep && global.totalcmd > timeoutShift, action: aSleep},
        {condition: global.config.channelID.length > 1 && global.totalcmd > timeoutChannel, action: aChannel},
        {condition: global.config.autoReload && (!global.reloadTime || Date.now() > global.reloadTime), action: aReload},
        {condition: global.config.autoQuote, action: aQuote},
    ]

    for(const {condition, action} of shuffleArray(commands)) {
        if(condition) await action()
        const generalDelay = ranInt(17_000, 32_000) / commands.length
        await sleep(ranInt(generalDelay - 700, generalDelay + 1300))
    }
    // if(global.config.autoPray.length > 0 && (!timeoutPray || Date.now() - timeoutPray >= 360_000)) await aPray();
    // if(global.config.autoDaily) await aDaily();
    // if(global.config.autoHunt && (!timeoutHuntbot || Date.now() >= timeoutHuntbot)) await aHuntbot();
    // if(global.config.autoOther && (!timeoutOther || Date.now() - timeoutOther >= 60_000)) await aOther();
    // if(global.config.autoGamble.length > 0) await aGamble();
    // if(global.config.autoSleep && global.totalcmd > timeoutShift) await aSleep();
    // if(global.config.channelID.length > 1 && global.totalcmd > timeoutChannel) await aChannel();
    // if(global.config.autoReload && (!global.reloadTime || Date.now() > global.reloadTime)) aReload();
    // if(global.config.autoQuote) await aQuote();
    main();
}

export const selfbotNotify = async (message:Message<boolean>, failed = false) => {
    const content = `${global.config.userNotify ? `<@${global.config.userNotify}>` : ""} Captcha Found in Channel: ${message.channel.toString()}`
    const attachment = message.attachments.first()

    if(global.config.wayNotify.includes(0)) try {
        let command:string;
        switch (process.platform) {
            case "win32": command = `start ""`; break;
            case "linux": command = `xdg-open`; break;
            case "darwin": command = `afplay`; break;
            case "android": command = `termux-media-player play`; break;
            default: throw new Error("Unsupported Platform");
        }
        command += ` "${global.config.musicPath}"`
        spawn(command, {
            shell: true,
            detached: true,
            stdio: "ignore"
        }).unref();
    } catch (error) {
        console.log(error)
        log("Failed to Play Sound", "e")
    }

    if(global.config.wayNotify.includes(1)) {
        let embed:MessageEmbed | undefined
        if(attachment) {
            embed = new MessageEmbed()
                .setTitle(`DMs ${global.config.userNotify ? "Selfbot Account" : "OwO Bot"} (Captcha Answer Only)`)
                .setDescription(failed ? "**UNSOLVED**" : "SOLVED")
                .setColor("#00ddff")
                .setImage(attachment.url)
                .setFooter({text: "Node.js Selfbot © 2023", iconURL: message.guild?.iconURL({format: "png"}) ?? "https://i.imgur.com/EqChQK1.png"})
                .setTimestamp()
        }
        try {
            const webhook = new WebhookClient({
                url: global.config.webhookURL!
            })
            await webhook.send({
                avatarURL: message.client.user?.avatarURL({ dynamic: true }) ?? "https://i.imgur.com/9wrvM38.png",
                username: "Captcha Detector",
                content,
                embeds: embed ? [embed] : embed

            })
        } catch (error) {
            console.log(error)
            log("Could Not Send The Notification via Webhook URL", "e")
        }
    }

    if(global.config.wayNotify.includes(2) || global.config.wayNotify.includes(3)) {
        try {
            const target = message.client.relationships.friendCache.get(global.config.userNotify!)
            if(!target) throw new Error("Notification Recipient Not Found")
            if(!target.dmChannel) await target.createDM()
            if(global.config.wayNotify.includes(2)) {
                target.send({
                    content,
                    files: attachment ? [attachment] : undefined
                }).catch(e => {console.log(e); log("Could Not DMs The Notification Recipient", "e")})
            } else {
                const calling = await target.dmChannel?.call()
                if(!calling) throw new Error("Could Not Call The Notification Recipient")
                setTimeout(() => {
                    if(calling) calling.disconnect()
                }, 30_000);
            }
        } catch (error) {
            log(`${error}`, "e")
        }
    }
}