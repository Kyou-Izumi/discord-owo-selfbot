import { Message } from "discord.js-selfbot-v13"

export default {
    info: "Make the Tool Perform command/say something",
    callback: (message:Message, ...args:string[]) => {
        message.channel.send(args.join(" "))
    }
}