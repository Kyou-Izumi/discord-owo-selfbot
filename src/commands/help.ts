import { Message } from "discord.js-selfbot-v13";
import { global } from "../../index.js";

export default {
    info: "List of Tool Commands",
    callback: (message:Message, ...args:string[]) => {
        let document = ""
        const listCommand = Object.keys(global.commands)
        for(const command of listCommand) document += `**${command}:** ${global.commands[command].info}\n`
        document += "Join Our Support Server For Help: https://discord.gg/Yr92g5Zx3e"
        if(args[0]) message.reply(
            listCommand.includes(args[0]) 
            ? `**${args[0]}:** ${global.commands[args[0]].info}`
            : "Command Not Found!"
        )
        else message.reply(document)
    }
}