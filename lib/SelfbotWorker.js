import { spawn } from "child_process";
import { global, DataPath } from "../index.js";
import { log } from "./console.js";
import { randomInt, sleep, webAccess } from "./extension.js";
import { MessageAttachment, MessageEmbed, WebhookClient } from "discord.js-selfbot-v13";
import fs from "fs";
import moment from "moment-timezone";

var channeltimeout = randomInt(13, 42), runtimeout = randomInt(57, 92), othertimer;
let odaily = "owo daily", opray = "owo pray", oinv = "owo inv", olb = "owo lootbox all", ouse = "owo use", ordinary = ["owo hunt", "owo battle", "owo hunt", "owo battle", "owo hunt"], oother = ["owo run", "owo pup", "owo piku"], ohb = "owo huntbot"
var inv, gem, gem1 = 0, gem2 = 0, gem3 = 0, box = false;

async function aCheck() {
    if(!(global.resetTime || global.resetTime instanceof Date || isNaN(global.resetTime))) global.resetTime = moment.utc(global.startTime).set({ hour: 0, minute: 0, second: 0 }).toDate();
    if(global.startTime >= global.resetTime) global.resetTime = moment.utc(global.resetTime).add(1, "day").toDate();
    const currentTime = moment.utc().toDate();
    if(currentTime >= global.resetTime) {
        try {
            global.resetTime = moment.utc(global.resetTime).add(1, "day").toDate();
            global.config = JSON.parse(fs.readFileSync(DataPath))[global.channel.client.user.id];
            return log("The configuration has been refreshed successfully", "i")
        } catch (error) {
            console.log(error);
            return log("Failed to refresh the configuration", "e")
        }
    }
}

async function aDaily() {
    if (global.captchaDetected) return; 
    global.channel.sendTyping();
    await sleep(randomInt(280, 2400));
    if (global.captchaDetected) return;
    global.channel.send(odaily);
    log(odaily);
    global.config.autoDaily = false;
    global.totalcmd++;
}

async function aPray() {
    if (global.captchaDetected) return;
    global.channel.sendTyping();
    await sleep(randomInt(180, 1300));
    if (global.captchaDetected) return;
    global.channel.send(opray);
    log(opray);
    global.totalcmd++;
    global.timer = 0;
}

async function changeChannel() {
    let arr = global.config.channelID.filter(cnl => cnl !== global.channel.id);
    global.channel = global.channel.client.channels.cache.get(arr[randomInt(0, arr.length)])
    log("Channel Changed To: #" + global.channel.name, "i")
    channeltimeout = global.totalcmd + randomInt(13, 42)
}

async function aSleep() {
    runtimeout = global.totalcmd + randomInt(57, 92);
    log("Selfbot Is Taking A Break", "i")
    await sleep(randomInt(179028, 727352))
}

async function aExtra(cmd) {
    if (global.captchaDetected) return;
    global.channel.sendTyping()
    await sleep(randomInt(220, 1900));
    if (global.captchaDetected) return;
    global.channel.send(cmd)
    log(cmd)
    global.totalcmd++;
    othertimer = Date.now()
}

async function aGem(param1, param2, param3) {
    if (global.captchaDetected) return;
    const filter = msg => msg.author.id === global.owoID  && msg.content.includes(msg.client.user.username) && msg.content.match(/Inventory|Please wait |Please slow down~/)
    global.channel.sendTyping();
    await sleep(randomInt(680, 3400));
    if (global.captchaDetected) return;
    global.channel.send(oinv);
    log(oinv)
    global.totalcmd++
    const collector = global.channel.createMessageCollector({filter, max: 1, time: 10_000})
    collector.on("collect", async (m) => {
        inv = m.content.split("`")
        gem1 = inv.filter(elm => elm.match(/^05[1-7]$/))
        gem2 = inv.filter(elm => elm.match(/^(06[5-9]|07[0-1])$/))
        gem3 = inv.filter(elm => elm.match(/^07[2-8]$/))
        inv.indexOf("050") >= 0 ? box = true : box = false
        if(box) {
            global.channel.sendTyping();
            await sleep(randomInt(680, 3400));
            global.channel.send(olb);
            log(olb);
            global.totalcmd++;
            await sleep(randomInt(8100, 9800))
            return aGem(param1, param2, param3);
        }
        gem = gem1.length + gem2.length + gem3.length;
        log("Found " + gem + " Hunt Gems In Inventory", "i");
        if(!gem > 0 && !box) return global.config.autoGem = false;
        gem1 = (gem1.length > 0 && param1) ? global.config.gemOrder === 0 ? Math.max(...gem1) : Math.min(...gem1) : "";
        gem2 = (gem2.length > 0 && param2) ? global.config.gemOrder === 0 ? Math.max(...gem2) : Math.min(...gem2) : "";
        gem3 = (gem3.length > 0 && param3) ? global.config.gemOrder === 0 ? Math.max(...gem3) : Math.min(...gem3) : "";
        global.channel.sendTyping();
        await sleep(randomInt(5300, 6800));
        global.channel.send(`${ouse} ${gem1} ${gem2} ${gem3}`.replace(/\s+/g, " "));
        log(`${ouse} ${gem1} ${gem2} ${gem3}`.replace(/\s+/g, " "));
        global.totalcmd++;
    })
}

async function aQuote() {
    if (global.captchaDetected) return;
    global.channel.sendTyping()
    await sleep(randomInt(2300, 5800))
    const percent = randomInt(1, 4)
    if(percent === 1) {
        if (global.captchaDetected) return;
        global.channel.send(["owo", "uwu"][randomInt(0,2)])
    }
    else try {
        const quote = await webAccess("get", "https://zenquotes.io/api/random")
        global.channel.send(quote[0]["q"])
    } catch (error) {
        return log("Error While Getting Quote To Send", "e")
    }
    global.totaltext++;
}

export async function notify(message, solved = false) {
    log(`Captcha Found In Channel: #${message.channel.name}`, "a")
    const content = `${global.config.userNotify ? `<@${global.config.userNotify}> ` : " "}Captcha Found In Channel: <#${message.channelId}>`

    if(global.config.wayNotify.includes(3)) {
        try {
            let command;
            switch(process.platform) {
                case "win32":   command = `start ""`;                   break;
                case "linux":   command = `xdg-open`;                   break;
                case "darwin":  command = `afplay`;                     break;
                case "android": command = `termux-media-player play`;   break;
                default: throw new Error("Unsupported platform");
            }
            if(typeof command == "string") {
                command += ` "${global.config.musicPath}"`
                const child = spawn(command, {
                    shell: true,
                    detached: true,
                    stdio: "ignore"
                })
                child.unref();
            }
        } catch (error) {
            console.log(error);
            log("Failed to play music", "e");
        }
    }

    if(global.config.wayNotify.includes(0)) {
        let embed = undefined;
        if(message.attachments) {
            embed = new MessageEmbed()
                .setTitle("DMs The Selfbot (Captcha Answer Only)")
                .setDescription(solved ? "SOLVED" : "**UNSOLVED**")
                .setColor("#0099ff")
                .setImage(message.attachments.first().url)
                .setURL("https://discord.com/channels/@me/" + message.client.user.id)
                .setFooter({text: 'Node.js Selfbot © 2022', iconURL: message.guild.icon ? message.guild.iconURL({format: "png"}) : "https://i.imgur.com/EqChQK1.png"})
                .setTimestamp()
        }
        try {
            const webhook = new WebhookClient({
                url: global.config.webhookURL
            })
            await webhook.send({
                content,
                username: "Captcha Detector",
                avatarURL: message.client.user.displayAvatarURL({ dynamics: true }),
                embeds: embed ? [embed] : embed
            })
        } catch (error) {
            log("Could Not Send The Notification Via Webhook", "e")
        }
    }

    if(global.config.wayNotify.includes(1)) {
        const attachment = message.attachments ? new MessageAttachment(message.attachments.first().url) : null;
        try {
            const target = message.client.relationships.friendCache.get(global.config.userNotify)
            if(!target.dmChannel) target.createDM()
            target.send({
                content,
                files: [attachment]
            })
        } catch (error) {
            console.log(error);
            log("Could Not Send The Notification Via DMs", "e")
        }
    }
    
    if(global.config.wayNotify.includes(2)) {
        try {
            const target = message.client.relationships.friendCache.get(global.config.userNotify)
            global.callingUser = true
            if(!target.dmChannel) target.createDM()
            await target.dmChannel.call()
        } catch (error) {
            console.log(error);
            log("Could Not Call The Notification Recipient", "e")
            global.callingUser = false;
        }
    }
}



export async function main() {
    if (global.captchaDetected) return;
    if(Date.now() - global.lastTime < 15000) return;
    var filter = m => m.author.id == global.owoID && m.content.includes(m.client.user.username) && m.content.match(/hunt is empowered by| spent 5 <:cowoncy:\d{18}> and caught a/)
    global.channel.sendTyping()
    await sleep(randomInt(128, 3400));
    switch (randomInt(0, 4)) {
        case 3:
            if(global.config.autoSlash) {
                try {
                    var arr = ["hunt", "battle"]
                    var cmd = arr[randomInt(0, arr.length)]
                    global.channel.sendSlash(global.owoID, cmd);
                    global.totalcmd++
                    log(`/${cmd}`);
                    global.lastTime = Date.now();
                    break;
                } catch (error) {
                    log("Failed To Send Slash Command", "e");
                }
            }
    
        default:
            var cmd = ordinary[randomInt(0, ordinary.length)]
            if (global.captchaDetected) return;
            global.channel.send(cmd)
            global.totalcmd++
            log(cmd)
            global.lastTime = Date.now();
            if(cmd.includes("hunt") && global.config.autoGem) {
                const collector = await global.channel.createMessageCollector({filter, max: 1, time: 10_000})
                collector.on("collect", async (msg) => {
                    let param1, param2, param3;
                    param1 = !msg.content.includes("gem1");
                    param2 = !msg.content.includes("gem3");
                    param3 = !msg.content.includes("gem4");
                    if (param1 || param2 || param3) await aGem(param1, param2, param3);
                })
            }
    }
    
    await sleep(randomInt(15000, 27000))
    if(global.config.autoPray && (global.timer >= 360000 || global.totalcmd <= 2)) await aPray() 
    if(global.config.autoDaily) await aDaily()
    if(global.config.autoQuote) await aQuote()
    if(global.config.autoOther && (!othertimer || Date.now() - othertimer >= 60000)) {
        const cmd = oother[randomInt(0, oother.length)];
        await aExtra(cmd)
        const filter = m => m.author.id == global.owoID && m.content.startsWith("🚫 **|** ")
        const collector = await global.channel.createMessageCollector({filter, max: 1, time: 10_000})
        collector.on("collect", () => {
            if(oother.indexOf(cmd) > -1) oother.splice(oother.indexOf(cmd), 1)
            if(oother.length === 0) global.config.autoOther = false
        })
    }
    if(global.config.autoSleep && global.totalcmd >= runtimeout) await aSleep() 
    if(global.config.channelID.length > 1 && global.totalcmd >= channeltimeout) await changeChannel()
    if(global.config.autoRefresh) await aCheck()
    if(!global.captchaDetected) return main();
}