import fs from "node:fs";
import path from "node:path";
import { InquirerInputQuestion, InquirerCheckboxQuestion, InquirerListQuestion, Configuration, resolveData } from "./lib/class.js";
import { Client } from "discord.js-selfbot-v13";
import { accountCheck, accountRemove, checkUpdate } from "./Extension.js";
import { getResult, trueFalse, log } from "./Console.js";
import { global } from "../index.js";

const supportedAudioExtensions = [".wav", ".mp3", ".m4a", ".flac", ".ogg", "aac"]
const document = `Copyright 2023 © Eternity_VN x aiko-chan-ai. All rights reserved.\nFrom Github with ❤️\nBy using this module, you agree to our Terms of Use and accept any associated risks.\nPlease note that we do not take any responsibility for accounts being banned due to the use of our tools.`

let client:Client<boolean>, guildID:string, channelID:string[], waynotify:number[], webhookURL:string, autopray:string[],
usernotify:string, musicPath:string, solveCaptcha:number, apiuser:string, apikey:string, prefix:string,
apilink:string, autogem:number, autocrate:boolean = false, autoquote:boolean, autoreload:boolean,
autosleep:boolean, autoresume:boolean, autoslash:boolean, autoother:boolean, autodaily:boolean, 
autosell:boolean, autohunt:boolean, upgradetrait:number, autogamble:string[], gamblingAmount:string

const listAccount = (data: {[key:string]: Configuration}) => {
    return new InquirerListQuestion<{ answer: string }>({
        type: "list",
        message: "Select an accout to login",
        choices: [
            ...new Set(Object.keys(data).map(user => ({name: data[user].tag, value: user}))),
            {name: "New Account (Sign In With Token)", value: "0"},
            {name: "New Account (Sign In With QR Code)", value: "1"},
            {name: "About Us", value: "3", disabled: true},
        ]
    })
}

const getToken = ()=> {
    return new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter Your Token",
        validate: (token: string) => {
            return token.split(".").length === 3 ? true : "Invalid Token";
        }
    });
};

const getAccount = () => {
    const username = new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter Your Email/Phone Number: ",
        validate(ans:string) {
            return ans.match(/^((\+?\d{1,2}\s?)?(\d{3}\s?\d{3}\s?\d{4}|\d{10}))|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/) ? true : "Invalid Email/Phone Number";
        }
    })
    const password = new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter Your Password: ",
        validate(ans:string) {
            return ans.match(/^.+$/) ? true : "Invalid Input";
        }
    })
    const mfaCode = new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter Your 2FA/Backup Code: ",
        validate: (ans:string) => {
            return ans.match(/^([0-9]{6}|[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4})$/) ? true : "Invalid 2FA/Backup Code"
        }
    })
    return [username, password, mfaCode]
}

const listGuild = (cache?: string) => {
    return new InquirerListQuestion<{ answer: string }>({
        type: "list",
        message: "Select a guild to farm",
        choices: client.guilds.cache.map((guild) => ({name: guild.name, value: guild.id})),
        default: cache
    })
};

const listChannel = (cache?: string[]) => {  
    const guild = client.guilds.cache.get(guildID)!
    return new InquirerCheckboxQuestion<{ answer: string[] }>({
        type: "checkbox",
        message: "Select channels to farm (Farming Channel will be changed randomly if multiple channels are selected)",
        choices: guild.channels.cache
            .filter((cnl) => (cnl.type == "GUILD_NEWS" || cnl.type == "GUILD_TEXT") && cnl.permissionsFor(guild.members.me!).has(["VIEW_CHANNEL", "SEND_MESSAGES"]))
            .map(ch => ({name: ch.name, value: ch.id})),
        validate: (answer: string[]) => {
            return answer.length > 0 ? true : "Please Choose At Least One Channel"
        },
        default: cache
    })
}

const wayNotify = (cache?: number[]) => {
    return new InquirerCheckboxQuestion<{ answer: number[] }>({
        type: "checkbox",
        message: "Select how you want to be notified when selfbot receives a captcha",
        choices: [
            {name: "Music", value: 0},
            {name: "Webhook", value: 1}, 
            {name: "Direct Message (Friends Only)", value: 2}, 
            {name: "Call (Friends Only)", value: 3}
        ],
        default: cache
    })
}

const webhook = (cache?:string) => {
    return new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter your webhook link",
        validate: (answer:string) => {
            return answer.match(/(^.*(discord|discordapp)\.com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$)/gm) ? true : "Invalid Webhook"
        },
        default: cache
    })
}

const userNotify = (cache?:string) => {
    return new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter user ID you want to be notified via Webhook/Call/Direct Message",
        validate: async (answer:string) => {
            if((waynotify.includes(2) || waynotify.includes(3)) && /^\d{17,19}$/.test(answer)) {
                if(answer == client.user?.id) return "Selfbot ID is not valid for Call/DMs option"
                const target = client.users.cache.get(answer)
                if(!target) return "User not found!"
                switch (target.relationship.toString()) {
                    case "FRIEND":
                        return true;
                    case "PENDING_INCOMING":
                        try {
                            return await target.sendFriendRequest()
                        } catch (error) {
                            return "Could not accept user's friend request!"
                        }
                    case "PENDING_OUTGOING":
                        return "Please accept selfbot's friend request!"
                    default:
                        try {
                            await target.sendFriendRequest()
                            return "Please accept selfbot's friend request!"
                        } catch (error) {
                            return "Could not send friend request to user!"
                        }
                }
            }
            return /^(\d{17,19}|)$/.test(answer) ? true : "Invalid User ID"
        },
        default: cache
    })
}

const musicNotify = (cache?:string) => {
    return new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter music file/directory path",
        validate: (answer:string) => {
            if(!/^([a-zA-Z]:)?(\/?[^\/\0+]+)+(\/[^\/\0]+)?$/.test(answer)) return "Invalid Path"
            if(!fs.existsSync(answer)) return "Path Not Found!"
            const stats = fs.statSync(answer);
            if(stats.isDirectory()) {
                if(fs.readdirSync(answer).some(file => supportedAudioExtensions.includes(path.extname(file)))) return true
                return "No Supported File Found!"
            }
            if(stats.isFile() && supportedAudioExtensions.includes(path.extname(answer))) return true;
            return "Invalid Directory"
        },
        default: cache
    })
}

const music2 = (directory:string) => {
    const supportedFiles = fs.readdirSync(directory).filter(
        file => supportedAudioExtensions.includes(path.extname(file))
    )
    return new InquirerListQuestion<{ answer: string }>({
        type: "list",
        message: "Select your music file",
        choices: [
            ...supportedFiles.map(file => ({name: file, value: path.join(directory, file)}))
        ]
    })
}

const captchaAPI = (cache?:number) => {
    return new InquirerListQuestion<{ answer: number }>({
        type: "list",
        message: "Select a captcha solving service (Selfbot will try once)",
        choices:[
            {name: "Skip", value: 0},
            {name: "TrueCaptcha (100 images - Free)", disabled: true},
            {name: "2Captcha (image and link - Paid)", value: 2},
            {name: "Selfbot API [Coming Soon]", disabled: true},
        ],
        default: cache
    })
}

const apiUser = (cache?:string) => {
    return new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter your API User ID",
        validate: (answer:string) => {
            return /^\S+$/.test(answer) ? true : "Invalid User ID"
        },
        default: cache
    })
}

const apiKey = (cache?:string) => {
    return new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "Enter your API Key",
        validate: (answer:string) => {
            return /^\S+$/.test(answer) ? true : "Invalid API Key"
        },
        default: cache
    })
}

const apiNCAI = (cache?:string) => {
    return new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "[BETA] Enter your NoCaptchaAI API Key, Empty to skip",
        validate: (answer:string) => {
            if(!answer) return true
            return /^\S+$/.test(answer) ? true : "Invalid API Key"
        },
        default: cache
    })
}

const botPrefix = (cache?:string) => {
    return new InquirerInputQuestion<{ answer: string }>({
        type: "input",
        message: "[BETA] Enter your Selfbot Prefix, Empty to skip",
        validate: (answer:string) => {
            if(!answer) return true;
            return /^[^0-9\s]{1,5}$/.test(answer) ? true : "Invalid Prefix"
        },
        default: cache
    })
}

const gemOrder = (cache?:number) => {
    return new InquirerListQuestion<{ answer: number }>({
        type: "list",
        message: "Select your gem usage order",
        choices:[
            { name: "Skip", value: -1 },
            { name: "Best to Worst", value: 0 },
            { name: "Worst to Best", value: 1 }
        ],
        default: cache
    })
}

const prayCurse = (cache?:string[]) => {
    return new InquirerCheckboxQuestion<{ answer: string[] }>({
        type: "checkbox",
        message: "Select to pray or curse (randomly if multiple), empty to skip",
        choices: [
            {name: "Pray selfbot account", value: `pray`},
            {name: "Curse selfbot account", value: `curse`},
            ...(usernotify ? [
                {name: "Pray notification reception", value: `pray ${usernotify}`},
                {name: "Curse notification reception", value: `curse ${usernotify}`}
            ] : [])
        ],
        default: cache
    })
}

const huntBot = (cache?:number) => {
    return new InquirerListQuestion<{ answer: number }>({
        type: "list",
        message: "Select which huntbot trait to upgrade, empty to skip",
        choices: [
            {name: "Efficiency", value: 1},
            {name: "Duration", value: 2},
            {name: "Cost", value: 3},
            {name: "Gain", value: 4},
            {name: "Experience", value: 5},
            {name: "Radar", value: 6},
        ],
        default: cache
    })
}

const Gamble = (cache?:string[]) => {
    return new InquirerCheckboxQuestion<{ answer: string[] }>({
        type: "checkbox",
        message: "Select which gambling method to use, empty to skip",
        choices: [
            "Blackjack",
            "Slots",
            "Coinflip",
            "Lottery"
        ],
        default: cache
    })
}

const gambleAmount = (cache?:string) => {
    return new InquirerInputQuestion<{ answer:string }>({
        type: "input",
        message: "Enter the amount of cowoncy to gamble",
        validate: (input) => {return /^\d+$/.test(input) ?? "Invalid cowoncy balance"},
        default: cache ?? "1"
    })
}

export const collectData = async (data:{[key:string]: Configuration}) => {
    console.clear()
    await checkUpdate()
    if(JSON.stringify(data) == "{}") {
        const res = await getResult(trueFalse("Do You Want To Countinue", false), document)
        if(!res) process.exit(1)
    }
    let account:string, loginMethod: string | undefined, cache: Configuration | undefined;
    while (!client) {
        account = await getResult(listAccount(data))
        switch (account) {
            case "0":
                loginMethod = await getResult(getToken())
                break;
            case "1":
                break;
            default:
                const obj = data[account]
                cache = obj
                loginMethod = obj.token
                break;
        }
        log("Checking Account...", "i")
        try {
            client = await accountCheck(loginMethod)
        } catch (error) {
            log(`${error}`, "e")
            if(data[account]) accountRemove(data, account)
            process.exit(1)
        }
    }

    guildID = await getResult(listGuild(cache?.guildID))
    channelID = await getResult(listChannel(cache?.channelID))
    waynotify = await getResult(wayNotify(cache?.wayNotify))
    if(waynotify.includes(0)) {
        musicPath = await getResult(musicNotify(cache?.musicPath))
        if(fs.statSync(musicPath).isDirectory()) musicPath = await getResult(music2(musicPath))
    }
    if(waynotify.includes(1)) webhookURL = await getResult(webhook(cache?.webhookURL))
    if(waynotify.includes(1) || waynotify.includes(2) || waynotify.includes(3)) usernotify = await getResult(userNotify(cache?.userNotify)) 
    solveCaptcha = await getResult(captchaAPI(cache?.captchaAPI))
    if(solveCaptcha === 1) {
        apiuser = await getResult(apiUser(cache?.apiUser), "Head To This Website And SignUp/SignIn. Then Copy The \x1b[1m\"userid\"\x1b[0m Value On [API Tab] And Paste It Here\nLink: https://truecaptcha.org/api.html")
        apikey = await getResult(apiKey(cache?.apiKey), "Head To This Website And SignUp/SignIn. Then Copy The \x1b[1m\"apikey\"\x1b[0m Value On [API Tab] And Paste It Here\nLink: https://truecaptcha.org/api.html")
    }
    else if(solveCaptcha === 2) apikey = await getResult(apiKey(cache?.apiKey), "Head To This Website And SignUp/SignIn. Then Copy The \x1b[1m\"API Key\"\x1b[0m Value in Account Settings On [Dashboard Tab] And Paste It Here\nLink: https://2captcha.com/enterpage")
    prefix = await getResult(botPrefix(cache?.cmdPrefix))
    // apilink = await getResult(apiNCAI(cache?.apiNCAI), "Head To This Website And SignUp/SignIn. Then Copy The \x1b[1m\"APIKEY\"\x1b[0m Value And Paste It Here\nLink: https://dash.nocaptchaai.com/home")
    autopray = await getResult(prayCurse(cache?.autoPray))
    autogem = await getResult(gemOrder(cache?.autoGem))
    if(autogem >= 0) autocrate = await getResult(trueFalse("Toggle Automatically Use Gem Crate", cache?.autoCrate))
    if(solveCaptcha != 0) autohunt = await getResult(trueFalse("Toggle Automatically send/receive AutoHunt/Huntbot", cache?.autoHunt))
    autogamble = await getResult(Gamble(cache?.autoGamble))
    if(autogamble.length > 0) gamblingAmount = await getResult(gambleAmount(cache?.gamblingAmount))
    autoquote =  await getResult(trueFalse("Toggle Automatically send owo/quotes to level up", cache?.autoQuote))
    autoslash =  await getResult(trueFalse("Toggle Automatically use slash commands", cache?.autoSlash))
    autoother =  await getResult(trueFalse("Toggle Automatically send Run/Pup/Piku commands", cache?.autoOther))
    autodaily =  await getResult(trueFalse("Toggle Automatically claim daily reward", cache?.autoDaily))
    autosell  =  await getResult(trueFalse("Toggle Automatically sell animals once cash runs out", cache?.autoSell))
    autosleep =  await getResult(trueFalse("Toggle Automatically pause after times", cache?.autoSleep))
    autoreload = await getResult(trueFalse("Toggle Automatically reload configuration on new day", cache?.autoReload))
    autoresume = await getResult(trueFalse("Toggle Automatically resume after captcha is solved", cache?.autoResume))
    const conf = resolveData(
        `${client.user?.displayName}`,
        client.token!,
        guildID,
        channelID,
        waynotify,
        musicPath,
        webhookURL,
        usernotify,
        solveCaptcha,
        apiuser,
        apikey,
        apilink,
        prefix,
        autopray,
        autogem,
        autocrate,
        autohunt,
        upgradetrait,
        autogamble,
        gamblingAmount,
        autoslash,
        autoquote,
        autodaily,
        autosell,
        autoother,
        autosleep,
        autoreload,
        autoresume
    )
    data[`${client.user?.id}`] = conf
    fs.writeFileSync(global.DataPath, JSON.stringify(data))
    log(`Data Saved To: ${global.DataPath}`, "i")
    return { client, conf }
}