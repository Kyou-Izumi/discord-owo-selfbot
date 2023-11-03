import { Message } from "discord.js-selfbot-v13";
import { global } from "../../index.js";

export default {
    info: "Pause the Tool",
    callback: (message:Message, ...args:string[]) => {
        if(global.captchaDetected) {
            message.reply(
                global.paused ?
                "Tool is already paused!" :
                "**ACTION REQUIRED!** You must solve the captcha before pausing the tool"
            )
        } else {
            global.captchaDetected = true
            global.paused = true
            message.reply("Tool is paused!")
        }
    }
}