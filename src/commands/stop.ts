import { Message } from "discord.js-selfbot-v13";

export default {
    info: "Stop the Tool from Running",
    callback: (message:Message, ...args:string[]) => {
        message.reply("Shutting down...")
        process.emit("SIGINT")
    }
}