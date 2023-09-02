import { Message } from "discord.js-selfbot-v13";

export default {
    info: "Tool Website Service Ping",
    callback: (message:Message, ...args:string[]) => {
        message.reply(`Pong! ${message.client.ws.ping}ms~`)
    }
}