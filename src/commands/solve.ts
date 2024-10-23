import { Message } from "discord.js-selfbot-v13";
import { global } from "../../index.js";
import { solveCaptcha } from "../Kyou.js";

export default {
    info: "Retry solving HCaptcha",
    callback: async (message:Message, ...args:string[]) => {
        message.channel.sendTyping()
        if(!global.captchaDetected) return message.reply("No captcha detected")
        try {
            await solveCaptcha(message.client)
            message.reply("✅ Captcha solved!")
        } catch (error) {
            console.error(error)
            message.reply("❌ Attempt to solve captcha failed.")
        }
    }
}