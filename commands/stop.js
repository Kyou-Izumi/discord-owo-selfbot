export default {
    info: "Stop The Tool From Running",
    callback: (message, ...args) => {
        message.reply("Shutting down the tool")
        process.kill(process.pid, "SIGINT");
    }
}