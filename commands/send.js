import { global } from "../index.js"

export default {
    info: "Send cash to someone",
    callback: async (message, ...args) => {
        try {
            if(message.channel.type == "DM" || message.channel.type == "GROUP_DM") return message.reply("You must send this command in a server")
            if(!args) return message.reply("You must mention someone and amount of cowoncy")
            const target = message.mentions.members.first()
            const owo = message.guild.members.cache.get(global.owoID)
            if(!target) return message.reply("You must mention an user to send cowoncy")
            if(!owo) return message.reply("No OwO Bot Found")
            if(!args[1].match(/^[0-9]+$/)) return message.reply("You must include an amount of cowoncy to send")
            message.channel.send(`owo send <@!${target.id}> ${args[1]}`)
            const filter = msg => msg.author.id === global.owoID  && msg.embeds && msg.components.length
            const collector = message.channel.createMessageCollector({filter, max: 5, time: 10_000})
            collector.on("collect", async (m) => {if(m.embeds[0].author.name.includes(message.client.user.tag)) await m.clickButton({ row: 0, col: 0 })})
        } catch (error) {
            message.reply("Failed to perform command")
            console.log(error)
        }
    }
}