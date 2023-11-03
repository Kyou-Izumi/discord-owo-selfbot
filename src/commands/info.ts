import { Message } from "discord.js-selfbot-v13";
import { global } from "../../index.js";
import { timeHandler } from "../Extension.js";

export default {
    info: "Tool Information",
    callback: (message:Message, ...args:string[]) => {
        const status = global.captchaDetected ? global.paused ? "**PAUSED**" : "**PENDING CAPTCHA SOLVING**" : "HUNTING";
        message.reply(`__Uptime:__ **${timeHandler(global.startTime, Date.now())}**\n__Status:__ ${status}`)
    }
}