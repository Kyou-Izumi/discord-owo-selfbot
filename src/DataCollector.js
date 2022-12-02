import { accountCheck, accountRemove } from "../lib/extension.js";
import { getResult, trueFalse, listCheckbox } from "../lib/prompt.js";
import { log } from "../lib/console.js";

import fs from "fs";

function listAccount(data) {
    const obj = listCheckbox("list", "Select an accout to login", [...new Set(Object.values(data).map(user => user.tag)), {name: "New Account (Sign In With Token)", value: 0}, {name: "New Account (Sign In  With QR Code)", value: 1}])
    obj.filter = (value) => {
        const user = Object.values(data).find(u => u.tag == value);
        if(user) return Buffer.from(user.token.split(".")[0], "base64").toString();
        else return value;
    }
    return obj;
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
    const obj = listCheckbox("checkbox", "Select channels to farm (Farming Channel will be changed randomly if multiple channels are selected)", [{name: "Back to guilds select", value: -1}, ...channelList.map(ch => ({name: ch.name, value: ch.id}))])
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
            return ans.match(/(^.*(discord|discordapp)\.com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$)/gm) ? true : "Invalid Webhook"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function userNotify(client, wayNotify, cache){
    const obj = {
        type: "input",
        message: "Enter user ID you want to be notified via Webhook/Call/Direct Message",
        async validate(ans) {
            if(ans.match(/^\d{17,19}$/)) {
                if(wayNotify.includes(1) || wayNotify.includes(2)) {
                    if(ans == client.user.id) return "Selfbot account ID is not valid for Call/Direct Message option"
                    const target = client.users.cache.get(ans);
                    if(!target) return "User not found";
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
                }
                return true
            }
            return "Invalid User ID"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function captchaAPI(cache=false) {
    return trueFalse("[BETA] Do you want to let the selfbot try to solve captcha once", cache)
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

function resolveData(tag, token, guildID, channelID = [], wayNotify = [], webhookURL, userNotify, captchaAPI, apiUser, apiKey, autoDaily, autoPray, autoGem, autoQuote, autoSleep, autoWait) {
    return {
        tag,
        token,
        guildID,
        channelID,
        wayNotify,
        webhookURL,
        userNotify,
        captchaAPI,
        apiUser,
        apiKey,
        autoDaily,
        autoPray,
        autoGem,
        autoQuote,
        autoSleep,
        autoWait
    }
}

export async function collectData(data, DataPath) {
    var client, cache, config;
    var guildid, channelid, waynotify, webhookurl, usernotify, autoCaptcha, apiuser, apikey;
    var autodaily, autopray, autoquote, autogem, autosleep, autowait;
    if(JSON.stringify(data) == "{}") {
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
        client = await accountCheck(obj.token)
    }
    if(typeof client == "string") {
        log(client, "e");
        if(data[account]) accountRemove(account, data, DataPath);
        process.exit(1);
    }
    client.token = await client.createToken();
    guildid = await getResult(listGuild(client, cache?.guildID));
    channelid = await getResult(listChannel(client, guildid, cache?.channelID));
    while (channelid.includes(-1)) {
        guildid = await getResult(listGuild(client, cache?.guildID));
        channelid = await getResult(listChannel(client, guildid, cache?.channelID));
    }
    waynotify = await getResult(wayNotify(cache?.wayNotify));
    if(waynotify.includes(0))
    webhookurl = await getResult(webhook(cache?.webhookURL));
    if(waynotify)
    usernotify = await getResult(userNotify(client, waynotify, cache?.userNotify));
    autoCaptcha = await getResult(captchaAPI(cache?.captchaAPI))
    if(autoCaptcha) {
        apiuser = await getResult(apiUser(cache?.apiUser), "Head To This Website And SignUp/SignIn \nThen Copy The \x1b[1m\"userid\"\x1b[0m Value On [API Tab] And Paste It Here\nLink: https://truecaptcha.org/api.html")
        apikey = await getResult(apiKey(cache?.apiKey), "Head To This Website And SignUp/SignIn \nThen Copy The \x1b[1m\"apikey\"\x1b[0m Value On [API Tab] And Paste It Here\nLink: https://truecaptcha.org/api.html")
    }
    autodaily = await getResult(trueFalse("Toggle Automatically Claim Daily Reward", cache?.autoDaily))
    autopray = await getResult(trueFalse("Toggle Automatically Pray", cache?.autoPray))
    autogem = await getResult(trueFalse("Toggle Automatically Use Hunt Gem", cache?.autoGem))
    autoquote = await getResult(trueFalse("Toggle Automatically Send Random Text To Level Up", cache?.autoQuote))
    autosleep = await getResult(trueFalse("Toggle Automatically Pause After A Time", cache?.autoSleep))
    autowait = await getResult(trueFalse("Toggle Automatically Resume After Captcha Is Solved"), cache?.autoWait)

    config = resolveData(client.user.tag, client.token, guildid, channelid, waynotify, webhookurl, usernotify, autoCaptcha, apiuser, apikey, autodaily, autopray, autogem, autoquote, autosleep, autowait)
    data[client.user.id] = config;
    fs.writeFileSync(DataPath, JSON.stringify(data), "utf8")
    log("Data Saved To: " + DataPath, "i")
    return { client, config };
}