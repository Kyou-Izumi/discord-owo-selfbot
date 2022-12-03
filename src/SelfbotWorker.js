
import { callingUser, channel, config, owoID, totalcmd, totaltext, captchaDetected } from "../index.js";
import { log } from "../lib/console.js";
import { randomInt, sleep, webAccess } from "../lib/extension.js";
import { MessageEmbed, WebhookClient } from "discord.js-selfbot-v13";

export var captchaDetected = false, timer = 0;
var channeltimeout = randomInt(13, 42), runtimeout = randomInt(57, 92);
let odaily = "owo daily", opray = "owo pray", oinv = "owo inv", olb = "owo lootbox all", ouse = "owo use", ordinary = ["owo hunt", "owo hunt", "owo battle"]
var inv, gem, gem1 = [], gem2 = [], gem3 = [], box = false;

async function aDaily() {
    if(captchaDetected) return;
    channel.sendTyping();
    await sleep(randomInt(950, 3700));
    channel.send(odaily);
    log(odaily);
    config.autoDaily = false;
    totalcmd++;
}

async function aPray() {
    if(captchaDetected) return;
    channel.sendTyping();
    await sleep(randomInt(950, 3700));
    channel.send(opray);
    log(opray);
    totalcmd++;
    timer = 0;
}

async function changeChannel() {
    let arr = config.channelID.filter(cnl => cnl !== channel.id);
    channel = client.channels.cache.get(arr[randomInt(0, arr.length)])
    log("Channel Changed To " + channel.name)
    channeltimeout = totalcmd + randomInt(13, 42)
}

async function aSleep() {
    runtimeout = totalcmd + randomInt(57, 92);
    await sleep(randomInt(180000, 717352))
}

async function aGem() {
    if(captchaDetected) return;
    const filter = msg => msg.author.id === owoID && msg.content.includes(msg.client.user.username) && msg.content.match(/Inventory|Please wait |Please slow down~/)
    channel.sendTyping();
    await sleep(randomInt(950, 3700));
    channel.send(oinv);
    const collector = channel.createMessageCollector({filter, max: 1, maxProcessed: 1, time: 10_000})
    collector.on("collect", async (m) => {
        inv = m.content.split("`")
        gem1 = inv.filter(elm => elm.match(/^05[1-7]$/))
        gem2 = inv.filter(elm => elm.match(/^(06[5-9]|07[0-1])$/))
        gem3 = inv.filter(elm => elm.match(/^07[2-8]$/))
        inv.indexOf("050") >= 0 ? box = true : box = false
        if(box) {
            channel.sendTyping();
            await sleep(randomInt(950, 3700));
            channel.send(olb);
            totalcmd++;
            await sleep(randomInt(8100, 9800))
            return aGem();
        }
        gem = gem1.length + gem2.length + gem3.length;
        log("Found " + gem + " Hunt Gems In Inventory", "i");
        if(!gem > 0 && !box) return config.autoGem = false;
        gem1.length === 0 ? gem1 = "" : gem1 = Math.max(...gem1);
        gem2.length === 0 ? gem2 = "" : gem2 = Math.max(...gem2);
        gem3.length === 0 ? gem3 = "" : gem3 = Math.max(...gem3);
        channel.sendTyping()
        await sleep(randomInt(5300, 6800))
        channel.send(`${ouse} ${gem1} ${gem2} ${gem3}`.replace(/\s+/g, " "));
        log(`${ouse} ${gem1} ${gem2} ${gem3}`.replace(/\s+/g, " "));
        totalcmd++;
    })
}

async function aQuote() {
    if(captchaDetected) return;
    channel.sendTyping()
    await sleep(randomInt(2300, 5800))
    const percent = randomInt(1, 4)
    if(percent === 1) channel.send(["owo", "uwu"][randomInt(0,2)])
    else try {
        const quote = await webAccess("get", "https://zenquotes.io/api/random")
        channel.send(quote[0]["q"])
    } catch (error) {
        return log("Error While Getting Quote To Send", "e")
    }
    totaltext++;
}

export async function notify(message, solved = false) {
    log(`Captcha Found In Channel: <#${message.channelId}>`, "a")
    const notification = {
        content: config.userNotify ? `<@${config.userNotify}>` : "" + `Captcha Found In Channel: <#${message.channelId}>`
    }
    if(config.wayNotify.includes(0)) {
        if(message.attachments) {
            const embed = new MessageEmbed()
                .setTitle("DMs The Selfbot (Captcha Answer Only)")
                .setDescription(solved ? "SOLVED" : "**UNSOLVED**")
                .setColor("#0099ff")
                .setImage(message.attachments.first().url)
                .setURL("https://discord.com/channels/@me/" + message.client.user.id)
                .setFooter({text: 'Node.js Selfbot © 2022', iconURL: message.guild.iconURL({format: "png"})})
                .setTimestamp()
            notification.embeds = [embed]
        }
        try {
            notification.username = "Captcha Detector"
            notification.avatarURL = message.client.user.displayAvatarURL({ dynamics: true })
            const webhook = new WebhookClient({
                url: config.webhookURL
            })
            await webhook.send(notification)
        } catch (error) {
            log("Could Not Send The Notification Via Webhook", "e")
        }
    }
    if(config.wayNotify.includes(1)) {
        delete notification.embeds;
        delete notification.username;
        delete notification.avatarURL;
        try {
            const target = client.users.cache.get(config.userNotify)
            if(!target.dmChannel) target.createDM()
            target.send(notification)
        } catch (error) {
            log("Could Not Send The Notification Via DMs", "e")
        }
    }
    if(config.wayNotify.includes(2)) {
        try {
            const target = client.users.cache.get(config.userNotify)
            callingUser = true
            await target.dmChannel.call()
        } catch (error) {
            log("Could Not Call The Notification Recipient", "e")
            callingUser = false;
        }
    }
    callingUser = false
}

export async function main() {
    if(captchaDetected) return
    var filter = m => m.author.id == owoID && m.content.includes(m.client.user.username) && m.content.match(/hunt is empowered by| spent 5 <:cowoncy:\d{18}> and caught a | Please wait |Please slow down~/)
    var cmd = ordinary[randomInt(0, ordinary.length)]
    channel.sendTyping()
    await sleep(randomInt(950, 3700));
    channel.send(cmd)
    log(cmd)
    if(cmd == "owo hunt" && config.autoGem) {
        const collector = await channel.createMessageCollector({filter, max: 1, time: 10_000})
        collector.on("collect", async (msg) => {
            if(msg.content.match(/Please wait |Please slow down~/)) return
            if(!msg.content.includes("gem1") && typeof gem1 == "string") return
            if(!msg.content.includes("gem3") && typeof gem2 == "string") return
            if(!msg.content.includes("gem4") && typeof gem3 == "string") return
            await aGem()
        })
    }
    await sleep(ranInt(15000, 22000))
    if(config.autoPray && (timer >= 360000 || totalcmd <= 2)) await aPray() 
    if(config.autoDaily) await aDaily()
    if(config.autoQuote) await aQuote()
    if(config.autoSleep && totalcmd >= runtimeout) await aSleep() 
    if(config.channelID.length > 1 && totalcmd >= channeltimeout) await changeChannel()
    return main()
}