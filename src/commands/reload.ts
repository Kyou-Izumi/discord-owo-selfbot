import { Message } from "discord.js-selfbot-v13";
import { aReload } from "../SelfbotWorker.js";

export default {
    info: "Reload The Configuration",
    callback: (message:Message, ...args:string[]) => {
        const attempt = aReload(true)
        if(attempt) message.reply("The configuration has been refreshed successfully")
        else message.reply("Failed to refresh the configuration")
    }
}