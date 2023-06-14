import { aCheck } from "../lib/SelfbotWorker.js"
export default {
    info: "Reload The Configuration",
    callback: (message, ...args) => {
        try {
            aCheck(true);
            message.reply("The configuration has been refreshed successfully")
        } catch (error) {
            message.reply("Failed to refresh the configuration")
        }
    }
}