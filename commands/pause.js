import { global } from "../index.js"
export default {
    info: "Pause the tool",
    callback: (message, ...args) => {
        if(global.captchaDetected) {
            if(global.paused) return message.reply("The tool is already paused!")
            else return message.reply("**ACTION REQUIRED!** You must solve the captcha image before pausing the tool")
        }
        else {
            global.captchaDetected = true
            global.paused = true
            message.reply("Tool is paused!")
        }
    }
}