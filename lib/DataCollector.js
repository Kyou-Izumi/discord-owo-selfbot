import { accountCheck, accountRemove } from "./extension";
import { getResult, trueFalse, listCheckbox } from "./prompt";
import { log } from "./console";

function listAccount(data) {
    const obj = listCheckbox("list", "Select an accout to login", [...new Set(Object.values(data).map(user => user.tag)), {name: "New Account (Sign In With Token)", value: 0}, {name: "New Account (Sign In  With QR Code)", value: 1}])
    obj.filter = (value) => {
        const user = Object.values(data).find(u => u.tag == value);
        if(user) return Buffer.from(user.token.split(".")[0], "base64").toString();
        else return value;
    }
};

function getToken() {
    return {
        type: "input",
        validate(token) {
            return token.split(".").length === 3 ? true : "Invalid Token";
        },
        message: "Enter Your Token"
    };
}

function listGuild(client, cache) {
    const obj = listCheckbox("list", "Select a guild to farm", client.guilds.cache.map(guild => ({name: guild.name, value: guild.id})))
    if(cache && client.guilds.cache.get(cache)) obj.default = cache;
    return obj;
}

function listChannel(client, guildID, cache) {
    const guild = client.guilds.cache.get(guildID);
    const channelList = guild.channels.cache.filter(cnl => ["GUILD_NEWS", "GUILD_TEXT"].includes(cnl.type) && cnl.permissionsFor(guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
    const obj = listCheckbox("checkbox", "Select channels to farm (Farming Channel will be changed randomly if multiple channels are selected)", [{name: "Back to guilds select", value: 0}, ...channelList.map(ch => ({name: ch.name, value: ch.id}))])
    if(cache && channelList.some(cn => cache.indexOf(cn) >= 0)) obj.default = channelList.filter(channel => cache.indexOf(channel) >= 0).map(channel => channel.id);
    return obj;
}

function wayNotify(cache) {
    const obj = listCheckbox("checkbox", "Select how you want to be notified when selfbot receives a captcha", [{name: "Webhook", value: 0}, {name: "Direct Message (Friends Only)", value: 1}, {name: "Call (Friends Only)", value: 2}])
    if(cache && typeof cache == "number") obj.default = cache;
    return obj;
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

function captchaAPI(cache) {
    return trueFalse("Do you want to let the selfbot try to solve captcha once", cache)
}

function apiUser(cache) {
    const obj = {
        type: "input",
        message: "Enter Your API User ID",
        validate(ans) {
            if(!ans || ans.match(/^\S+$/)) return true;
            else return "Invalid API User ID"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function apiKey(cache) {
    const obj = {
        type: "input",
        message: "Enter Your API Key",
        validate(ans) {
            return ans.match(/^[a-zA-Z0-9]{20}$/) ? true : "Invalid API Key"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

async function collectData(client, RawData, DataPath) {
    var client, cache, data = RawData[1];
    var guildID, channelID, waynotify, webhookURL, usernotify, autoCaptcha, apiuser, apikey;
    var autodaily, autopray, autoquote, autogem, autopause;
    if(JSON.stringify(data)) {
        const res = await getResult(
            trueFalse("Do You Want To Countinue", false), 
            "Copyright 2022 © Eternity_VN x aiko-chan-ai\nFrom Github with love\nBy Using This Module, You Agree To Our Terms Of Use And Accept The Risks That May Be Taken.\nPlease Note That We Do Not Take Any Responsibility For Accounts Banned Due To Using Our Tools"
        )
        if(!res) process.exit(1)
    }
    const account = await getResult(listAccount(data))
    if (account === 0) {
        const token = await getResult(getToken())
        log("Checking Account...", "i");
        client = await accountCheck(token);
    }
    else if (account === 1) {
        client = await accountCheck();
    }
    else {
        const obj = data[account];
        cache = obj;
        log("Checking Account...", "i");
    }
    if(typeof client == "string") {
        log(client, "e");
        if(data[account]) accountRemove(account, RawData, DataPath);
        process.exit(1);
    }
    client.token = await client.createToken();
    guildID = await getResult(listGuild(client, data?.guildID))
    channelID = await getResult(listChannel())
    waynotify = await getResult(wayNotify(data?.wayNotify))
    if(waynotify.includes(0))
    webhookURL = await getResult(webhook(data?.webhookURL))
    if(waynotify)
    usernotify = await
}