import { accountCheck, accountRemove, checkUpdate } from "./extension.js";
import { getResult, trueFalse, listCheckbox } from "./prompt.js";
import { log } from "./console.js";
import { DataPath } from "../index.js";

import fs from "fs";
import path from "path";

var client = null, cache, conf;
var guildid, channelid, waynotify, webhookurl, usernotify, autocaptcha, apiuser, apikey, musicpath, gemorder, prefix;
var autodaily, autopray, autoquote, autoother, autogem, autosleep, autowait, autorefresh, autolootbox, autoslash;

function listDocument() {
    const document = 
`\x1b[1mSpecial thanks to:

    \x1b[2m- \x1b[1mAiko-chan-ai      \x1b[1m[\x1b[0mContributor - API Library Creator\x1b[1m]
    \x1b[2m- \x1b[1miamz4ri           \x1b[1m[\x1b[0mContributor\x1b[1m]
    \x1b[2m- \x1b[1mkeepmeside        \x1b[1m[\x1b[0mContributor\x1b[1m]

\x1b[1mSupport us:
    \x1b[0m
    Hello there, my name is Eternityy, and I wanted to take a moment to thank you for using our tool.

    Since 2021, this project has been non-profit. But we're still committed to making it the best it can be, 
    
    With APIs like captcha-solving and quoting,... to help make your experience smoother and more efficient.

    Unfortunately, funding has become an obstacle to our progress. Would you be willing to help us out with a small donation? 
    
    Even the price of a coffee cup can go a long way towards keeping us going. Every little bit helps, means the world to us.

    Thank you for your time and consideration, and we hope you continue to enjoy our tool!`
    const obj = listCheckbox("list", document, [
        {name: "Donate Us", value: 1},
        {name: "Back", value: -1},
    ]);
    return obj;
}

function listAccount(data) {
    const obj = listCheckbox("list", "Select an accout to login", [
        ...new Set(Object.values(data).map(user => user.tag)), 
        {name: "New Account (Sign In With Token)", value: 0},
        {name: "New Account (Sign In With QR Code)", value: 1},
        {name: "New Account (Sign In With Password - MFA Required)", value: 2},
        {name: "About Us", value: 3},
    ])
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

function getAccount() {
    return [{
        type: "input",
        message: "Enter Your Email/Phone Number: ",
        validate(ans) {
            return ans.match(/^((\+?\d{1,2}\s?)?(\d{3}\s?\d{3}\s?\d{4}|\d{10}))|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/) ? true : "Invalid Email/Phone Number";
        }
    }, {
        type: "password",
        message: "Enter Your Password: ",
        validate(ans) {
            return ans.match(/^.+$/) ? true : "Invalid Input";
        }
    }, {
        type: "input",
        message: "Enter Your 2FA/Backup Code: ",
        validate: (ans) => {
            return ans.match(/^([0-9]{6}|[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4})$/) ? true : "Invalid 2FA/Backup Code"
        }
    }];

}

function listGuild(cache) {
    const obj = listCheckbox("list", "Select a guild to farm", client.guilds.cache.map(guild => ({name: guild.name, value: guild.id})))
    if(cache && client.guilds.cache.get(cache)) obj.default = () => {
        const guild = client.guilds.cache.get(cache)
        return guild.id
    };
    return obj;
}

function listChannel(cache) {
    const guild = client.guilds.cache.get(guildid);
    const channelList = guild.channels.cache.filter(cnl => ["GUILD_NEWS", "GUILD_TEXT"].includes(cnl.type) && cnl.permissionsFor(guild.me).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
    const obj = listCheckbox("checkbox", "Select channels to farm (Farming Channel will be changed randomly if multiple channels are selected)", [{name: "Back to guilds select", value: -1}, ...channelList.map(ch => ({name: ch.name, value: ch.id}))])
    obj.validate = (ans) => {return ans.length > 0 ? true : "Please Choose At Least One Channel" }
    if(cache && channelList.some(cn => cache.indexOf(cn.id) >= 0)) obj.default = [...channelList.filter(channel => cache.indexOf(channel.id) >= 0).map(channel => channel.id)];
    return obj;
}

function wayNotify(cache) {
    const obj = listCheckbox(
        "checkbox", 
        "Select how you want to be notified when selfbot receives a captcha", 
        [
            {name: "Music", value: 3},
            {name: "Webhook", value: 0}, 
            {name: "Direct Message (Friends Only)", value: 1}, 
            {name: "Call (Friends Only)", value: 2}
        ]
    )
    if(cache) obj.default = cache;
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

function userNotify(cache){
    const obj = {
        type: "input",
        message: "Enter user ID you want to be notified via Webhook/Call/Direct Message",
        async validate(ans) {
            if(waynotify.includes(1) || waynotify.includes(2)) {
                if(ans.match(/^\d{17,19}$/)) {
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
                    else if(target.relationships == "PENDING_OUTGOING") return "Please accept selfbot's friend request"
                    else if(target.relationships == "NONE") {
                        try {
                            await target.sendFriendRequest();
                            return "Please accept selfbot's friend request"
                        } catch (error) {
                            return "Could not send friend request to that user"
                        }
                    }
                }
            }
            return ans.match(/^(\d{17,19}|)$/) ? true : "Invalid User ID"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function music1(cache) {
    const obj = {
        type: "input",
        message: "Enter music file/path directory",
        validate(answer) {
            if(!answer.match(/^([a-zA-Z]:)?(\/?[^\/\0]+)+(\/[^\/\0]+)?$/)) return "Invalid Directory";
            const supportedAudioExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac'];
            if(!fs.existsSync(answer)) return "Could Not Find That Path";
            const stats = fs.statSync(answer)
            if(stats.isDirectory()) {
                if(fs.readdirSync(answer).some(file => supportedAudioExtensions.includes(path.extname(path.join(answer, file))))) return true;
                else return "No Supported File Found In That Directory"
            }
            if((stats.isFile() && supportedAudioExtensions.includes(path.extname(answer)))) return true;
            return "Invalid Directory";
        }
    };
    if(cache) obj.default = cache;
    return obj;
}

function music2(folder) {
    const supportedAudioExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac'];
    const files = fs.readdirSync(folder)
    const supportedFiles = files.filter(file => supportedAudioExtensions.includes(path.extname(file)))

    const obj = {
        type: "list",
        message: "Choose your music file",
        choices: [
            {name: "Back", value: "none"},
            ...supportedFiles.map(file => ({name: file, value: path.resolve(folder, file)}))
        ]
    }
    return obj
}

function captchaAPI(cache) {
    const obj = {
        type: "list",
        message: "[BETA] Please choose a Captcha service for Selfbot to try to solve captcha once",
        choices: [
            {name: "Skip", value: 0},
            {name: "TrueCaptcha (Free)", value: 1},
            {name: "2Captcha (Paid)", value: 2},
            {name: "Selfbot Captcha Solving API [Coming Soon]", disabled: true}
        ],
        loop: false
    }
    if(cache) obj.default = cache;
    return obj;
}


function apiUser(cache) {
    const obj = {
        type: "input",
        message: "Enter Your API User ID",
        validate(ans) {
            return ans.match(/^\S+$/) ? true : "Invalid API User ID"
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
            return ans.match(/^[a-zA-Z0-9]{20,}$/) ? true : "Invalid API Key"
        }
    }
    if(cache) obj.default = cache;
    return obj;
}

function botPrefix(cache) {
    const obj = {
        type: "input",
        message: "[BETA] Enter Your Selfbot Prefix (Only Notification Recipient And Selfbot Account Will Have Access To), Empty To Skip",
        validate(ans) {
            if(!ans) return true
            return ans.match(/^[^0-9\s]{1,5}$/) ? true : "Invalid Prefix";
        },
        filter(ans) {
            return ans.match(/^\s*$/) ? null : ans;
        }
    }
    if(cache) obj.default = cache
    return obj;
}

function gemOrder(cache) {
    const obj = listCheckbox(
        "list", 
        "Choose gem usage order for hunting", 
        [
            {name: "Best To Worst", value: 0},
            {name: "Worst To Best", value: 1}
        ]
    )
    if(cache) obj.default = cache;
    return obj;
}

function resolveData(tag, token, guildID, channelID = [], wayNotify = [], musicPath, webhookURL, userNotify, captchaAPI, apiUser, apiKey, cmdPrefix, autoDaily, autoPray, autoSlash, autoGem, autoLootbox, gemOrder, autoQuote, autoOther, autoRefresh, autoSleep, autoWait) {
    return {
        tag,
        token,
        guildID,
        channelID,
        wayNotify,
        musicPath,
        webhookURL,
        userNotify,
        captchaAPI,
        apiUser,
        apiKey,
        cmdPrefix,
        autoDaily,
        autoPray,
        autoSlash,
        autoGem,
        autoLootbox,
        gemOrder,
        autoQuote,
        autoOther,
        autoRefresh,
        autoSleep,
        autoWait
    }
}

export async function collectData(data) {
    console.clear()
    await checkUpdate();
    if(JSON.stringify(data) == "{}") {
        const res = await getResult(
            trueFalse("Do You Want To Countinue", false), 
            `Copyright 2023 © Eternity_VN x aiko-chan-ai. All rights reserved.
From Github with ❤️
By using this module, you agree to our Terms of Use and accept any associated risks.
Please note that we do not take any responsibility for accounts being banned due to the use of our tools.`
        )
        if(!res) process.exit(1)
    }
    let account
    while(!client) {
        account = await getResult(listAccount(data))
        if (account === 0) {
            const token = await getResult(getToken());
            log("Checking Account...", "i");
            client = await accountCheck(token);
        } else if (account === 1) {
            client = await accountCheck();
        } else if(account === 2){
            const profile = getAccount();
            const username = await getResult(profile[0])
            const password = await getResult(profile[1])
            const mfaCode = await getResult(profile[2])
            log("Checking Account...", "i");
            client = await accountCheck([username, password, mfaCode]);
        } else if(account === 3) {
            const choice = await getResult(listDocument());
            if(choice === 1) await getResult(listCheckbox("list", "Press Enter to go back", ["Back"]), "Thank you for your generous support, we are truly grateful!\n\n   \x1b[1mMB Bank Vietnam / Momo / ZaloPay:\x1b[0m      NGUYEN THANH LONG     0978176370\n")
        } else {
            const obj = data[account];
            cache = obj;
            log("Checking Account...", "i");
            client = await accountCheck(obj.token)
        }
    }
    if(typeof client == "string") {
        log(client, "e");
        if(data[account]) accountRemove(account, data);
        process.exit(1);
    }
    client.token = await client.createToken();
    guildid = await getResult(listGuild(cache?.guildID));
    channelid = await getResult(listChannel(cache?.channelID));
    while (channelid.includes(-1)) {
        guildid = await getResult(listGuild(cache?.guildID));
        channelid = await getResult(listChannel(cache?.channelID));
    }

    waynotify = await getResult(wayNotify(cache?.wayNotify));
    if(waynotify.includes(3)) {
        musicpath = await getResult(music1(cache?.musicPath));
        while (true) {
            if (!musicpath || musicpath == "none") musicpath = await getResult(music1(cache?.musicPath));
            else if (fs.statSync(musicpath).isDirectory()) musicpath = await getResult(music2(musicpath));
            else break;
        }
    }
    if(waynotify.includes(0)) webhookurl = await getResult(webhook(cache?.webhookURL));
    if(waynotify.includes(0) || waynotify.includes(1) || waynotify.includes(2)) usernotify = await getResult(userNotify(cache?.userNotify));
    autocaptcha = await getResult(captchaAPI(cache?.captchaAPI))
    if(autocaptcha === 1) {
        apiuser = await getResult(apiUser(cache?.apiUser), "Head To This Website And SignUp/SignIn \nThen Copy The \x1b[1m\"userid\"\x1b[0m Value On [API Tab] And Paste It Here\nLink: https://truecaptcha.org/api.html")
        apikey = await getResult(apiKey(cache?.apiKey), "Head To This Website And SignUp/SignIn \nThen Copy The \x1b[1m\"apikey\"\x1b[0m Value On [API Tab] And Paste It Here\nLink: https://truecaptcha.org/api.html")
    }
    else if(autocaptcha === 2) apikey = await getResult(apiKey(cache?.apiKey), "Head To This Website And SignUp/SignIn \nThen Copy The \x1b[1m\"API Key\"\x1b[0m Value in Account Settings On [Dashboard Tab] And Paste It Here\nLink: https://2captcha.com/enterpage")
    prefix = await getResult(botPrefix(cache?.cmdPrefix))
    autodaily = await getResult(trueFalse("Toggle Automatically Claim Daily Reward", cache?.autoDaily))
    autopray = await getResult(trueFalse("Toggle Automatically Pray", cache?.autoPray))
    autoslash = await getResult(trueFalse("Toggle Automatically Use Slash Command", cache?.autoSlash))
    autogem = await getResult(trueFalse("Toggle Automatically Use Hunt Gems", cache?.autoGem))
    if(autogem) gemorder = await getResult(gemOrder(cache?.gemOrder))
    if(autogem) autolootbox = await getResult(trueFalse("Toggle Automatically Loot Boxes", cache?.autoLootbox))
    autoquote = await getResult(trueFalse("Toggle Automatically Send Random Text To Level Up", cache?.autoQuote))
    autoother = await getResult(trueFalse("Toggle Automatically Send Run/Pup/Piku Commands", cache?.autoOther))
    autorefresh = await getResult(trueFalse("Toggle Automatically Refresh The Configuration On New Day", cache?.autoRefresh))
    autosleep = await getResult(trueFalse("Toggle Automatically Pause After A Time", cache?.autoSleep))
    autowait = await getResult(trueFalse("Toggle Automatically Resume After Captcha Is Solved", cache?.autoWait))

    conf = resolveData(client.user.tag, client.token, guildid, channelid, waynotify, musicpath, webhookurl, usernotify, autocaptcha, apiuser, apikey, prefix, autodaily, autopray, autoslash, autogem, autolootbox, gemorder, autoquote, autoother, autorefresh, autosleep, autowait)
    data[client.user.id] = conf;
    fs.writeFileSync(DataPath, JSON.stringify(data), "utf8")
    log("Data Saved To: " + DataPath, "i")
    return { client, conf };
}