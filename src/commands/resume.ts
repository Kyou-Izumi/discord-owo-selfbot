import { global } from "../../index.js";
import { main } from "../SelfbotWorker.js";
import { Message } from "discord.js-selfbot-v13";

export default {
    info: "Resume the Tool",
    callback: (message:Message, ...args:string[]) => {
        if(global.paused) {
            global.paused = false
            global.captchaDetected = false
            message.reply("Tool is resume!")
            main()
        } else message.reply(
            global.captchaDetected ? 
            "**ACTION REQUIRED!** You must solve the captcha before resuming the tool" :
            "Tool is not paused!"
        )
    }
}