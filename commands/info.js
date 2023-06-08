import { global } from "../index.js"
import { timeHandler } from "../lib/extension.js";
export default {
    info: "Tool information",
    callback: (message, ...args) => {
        const status = global.captchaDetected ? global.paused ? "**PAUSED**" : "**PENDING CAPTCHA SOLVING**" : "HUNTING";
        message.reply(`__Uptime:__ **${timeHandler(global.startTime, Date.now())}**\n__Status:__ ${status}`)
    }
}