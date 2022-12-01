import { getResult } from "./inquirer"

function getToken() {
    return {
        type: "input",
        validate(token){
            return token.split(".").length === 3 ? true : "Invalid Token";
        },
        message: "Enter Your Token"
    };
}

function listAccount(data) {
    return {
        type: "list",
        message: "Select an account to login",
        choice: [...new Set(Object.values(data).map(user => user.tag))],
        pageSize: 10,
        loop: false,
        filter(value) {
            const user = Object.values(data).find(u => u.tag == value);
            if(user) return Buffer.from(user.token.split(".")[0], "base64").toString();
            else return value.includes('Token') ? 0 : 1;
        }
    };
};

function listGuild(client, cache) {
    let obj = {
        type: "list",
        message: "Select a guild to farm",
        choice: client.guilds.cache.map(guild => ({name: guild.name, value: guild.id})),
        pageSize: 10,
        loop: false
    };
    if(cache && client.guilds.cache.get(cache)) obj.default = cache;
    return obj;
}

function listChannel(client, guildID, cache) {
    const guild = client.guilds.cache.get(guildID);
    const channelList = guild.channels.cache.filter(cnl => ["GUILD_NEWS", "GUILD_TEXT"].includes(cnl.type) && cnl.permissionsFor(guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
    const obj = {
        type: "checkbox",
        message: "Select channels to farm (Farming Channel will be changed randomly if multiple channels are selected)",
        choice: [{name: "Back to guilds select", value: 0}, ...channelList.map(ch => ({name: ch.name, value: ch.id}))],
        pageSize: 10,
        loop: false,
    };
    if(cache && channelList.some(cn => cache.indexOf(cn) >= 0)) obj.default = channelList.filter(channel => cache.indexOf(channel) >= 0).map(channel => channel.id);
    return obj;
}

function wayNotify(cache) {
    const obj = {
        type: "checkbox",
        message: "Select how you want to be notified when selfbot receives a captcha",
        choice: [{name: "Webhook", value: 0}, {name: "Direct Message (Friends Only)", value: 1}, {name: "Call (Friends Only)", value: 2}],
        loop: false
    }
    if(cache && typeof cache == "number") obj.default = cache;
}

function webhook(cache) {
    const obj = {
        type: "input",
        message: "Enter your webhook link",
        validate(ans) {
            return ans.match(/(^.*(discord|discordapp)\.com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$)|^$/gm) ? true : "Invalid Webhook"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function userNotify(client, wayNotify, cache){
    const obj = {
        type: "number",
        message: "Enter user ID you want to be notified via Webhook/Call/Direct Message",
        async validate(ans) {
            if(ans.match(/^\d{17,19}$/)) {
                if(wayNotify.includes(1) || wayNotify.includes(2)) {
                    if(ans == client.user.id) return "Selfbot account ID is not valid for Call/Direct Message option"
                    const target = client.users.cache.get(ans);
                    if(target.relationships == "FRIEND") return true;
                    else if(target.relationships == "PENDING_INCOMING") {
                        try {
                            await target.setFriend();
                            return true;
                        } catch (error) {
                            return "Could not accept user's friend request"
                        }
                    }
                    else if(target.relationships == "PENDING_OUTCOMING") return "Please accept selfbot's friend request"
                    else if(target.relationships == "NONE") {
                        try {
                            await target.sendFriendRequest();
                            return "Please accept selfbot's friend request"
                        } catch (error) {
                            return "Could not send friend request to that user"
                        }
                    }
                    return "User not found"
                }
                return true
            }
            return "Invalid User ID"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

