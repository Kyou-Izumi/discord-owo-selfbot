import { global } from "../index.js";

export default {
    info: "List of tool commands",
    callback: (message, ...args) => {
        let doc = ""
        const arr = Object.keys(global.commands)
        for(const element of arr) {
            doc += `**${element}:** ${global.commands[element].info}\n`;
        }
        if(args[0]) {
            if(arr.includes(args[0])) message.reply(`**${args[0]}:** ${global.commands[args[0]].info}\n`);
            else message.reply("No Command Found");
        } else message.reply(doc);
    }
}