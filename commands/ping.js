export default {
    info: "Tool ping",
    callback: (message, ...args) => {
        message.reply(`Pong! ${message.client.ws.ping}ms`);
    }
}