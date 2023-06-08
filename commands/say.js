export default {
    info: "Make tool perform commands/say something",
    callback: (message, ...args) => {
        message.channel.send(args.join(" "));
    }
}