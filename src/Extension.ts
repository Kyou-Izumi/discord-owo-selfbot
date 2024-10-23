import discord from "discord.js-selfbot-v13"
import fs from "node:fs"
import path from "node:path"
import axios from "axios"
import { execSync, spawn } from "node:child_process"
import admZip from "adm-zip"
import os from "node:os"

import { global } from "../index.js"
import { Configuration } from "./lib/class.js"
import { getResult, trueFalse, log } from "./Console.js"

const ranInt = (min: number, max: number) => {return Math.floor(Math.random() * (max - min) + min)};
  
const mapInt = (number:number, fromMIN:number, fromMAX:number, toMIN:number, toMAX:number) => {return Math.floor(((number - fromMIN) / (fromMAX - fromMIN)) * (toMAX - toMIN) + toMIN)}

const sleep = (ms:number) => {return new Promise(resolve => setTimeout(resolve, ms))}

const timeHandler = (startTime: number, endTime: number, removeDay = false) => {
    const ms = Math.abs(startTime - endTime)
    const sc = Math.round(ms % 86400000 % 3600000 % 60000 / 1000)
    const mn = Math.floor(ms % 86400000 % 3600000 / 60000)
    const hr = Math.floor(ms % 86400000 / 3600000)
    const dy = Math.floor(ms / 86400000)
    return (removeDay ? "" : dy + (dy > 1 ? " days " : " day ")) + hr + ":" + mn + ":" + sc
}

const consoleNotify = async () => {
    console.log("\n")
    console.log("\x1b[92mTotal command sent: \x1b[0m" + global.totalcmd)
    console.log("\x1b[92mTotal text sent: \x1b[0m" + global.totaltxt)
    console.log("\x1b[92mTotal active time: \x1b[0m" + timeHandler(global.startTime, Date.now()))
    console.log("\x1b[36mSELFBOT HAS BEEN TERMINATED!\x1b[0m")
}

const send = async (str:string, type:"normalCommand"|"slashCommand"|"quote" = "normalCommand") => {
    if(global.captchaDetected) return;
    try {
        global.channel.sendTyping()
        await sleep(ranInt(120, 3700));
        switch (type) {
            case "quote":
                global.channel.send(str)
                global.totaltxt++
                break;
            case "normalCommand":
                const cmd = global.prefix[ranInt(0, global.prefix.length)] + " " + str
                global.channel.send(cmd)
                log(cmd);
                global.totalcmd++;
                break;
            case "slashCommand":
                await global.channel.sendSlash(global.owoID, str)
                log("/" + str)
                global.slashError = 0
                global.totalcmd++;
                break;
        }
    } catch (error) {
        const typeError = (
            type == "normalCommand" ? "Failed To Send OwO Command" :
            type == "slashCommand" ? "Failed To Send Slash Command":
            "Failed To Send Quote"
        )
        log(typeError, "e")
        if(type == "slashCommand") global.slashError++;
        if(global.slashError > 3) {
            global.config.autoSlash = false
            log("Slash Command has been Disabled Due to Too Many Errors", "i")
        }
    }
}

const getFiles = (dir:string, suffix:string):string[] => {
    const files:fs.Dirent[] = fs.readdirSync(dir, {
        withFileTypes: true
    })

    let commandFiles:string[] = []

    for(const file of files) {
        if(file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(path.join(dir, file.name), suffix)
            ]
        } else if(file.name.endsWith(suffix)) commandFiles.push(path.join(dir, file.name))
    }
    return commandFiles;
}

const copyDirectory = (sourceDir:string, destDir:string) => {
    if(!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive:true })
    const files = fs.readdirSync(sourceDir)
    for(const file of files) {
        const sourcePath = path.join(sourceDir, file)
        const destPath = path.join(destDir, file)
        if(fs.statSync(sourcePath).isDirectory()) copyDirectory(sourcePath, destPath)
        else fs.copyFileSync(sourcePath, destPath)
    }
}

const shuffleArray = <T>(array: T[]):T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

const accountCheck = (input?:string):Promise<discord.Client> => {
    const client = new discord.Client()
    return new Promise(async (resolve, reject) => {
        client.once("ready", () => resolve(client))
        try {
            if(typeof input == "string") await client.login(input)
            else client.QRLogin()
        } catch (error) {
            reject("Invalid Data, Please Login Again.")
        }
    })
}

const accountRemove = (data: {[keys:string]:Configuration}, id:string) => {
    delete data[id]
    fs.writeFileSync(global.DataPath, JSON.stringify(data))
}

const commandHandler = async () => {
    const commands = {} as {
        [key:string]: any
    }

    const suffix = ".js"
    const commandFiles = getFiles(path.join(process.cwd(), "/obfuscated/src/commands/"), suffix)

    for(const command of commandFiles) {
        let commandFile = await import(`file://${command}`)
        if(commandFile.default) commandFile = commandFile.default
        const commandName = path.basename(command).replace(suffix, "")
        commands[commandName.toLowerCase()] = commandFile
    }
    log(`Loaded ${Object.keys(commands).length} commands.`, "i")
    return commands
}

const reloadPresence = async (client:discord.Client) => {
    const getExternalURL = await discord.RichPresence.getExternal(
        client,
        "367827983903490050",
        "https://i.imgur.com/9wrvM38.png",
        "https://i.imgur.com/MscNx02.png"
    )
    const activity = new discord.RichPresence(client)
        .setApplicationId("367827983903490050")
        .setType("PLAYING")
        .setName("I AM ETERNITYYY")
        .setDetails("Simply fulfilling my duties")
        .setStartTimestamp(client.readyAt!)
        .setAssetsLargeImage(getExternalURL[0].external_asset_path)
        .setAssetsLargeText("You Dare Challenge me?")
        .setAssetsSmallImage(getExternalURL[1].external_asset_path)
        .setAssetsSmallText("BKI Eternityyy")
        .addButton('Github', "https://github.com/LongAKolangle/discord-owo-selfbot")
        .addButton('Youtube', "https://www.youtube.com/@daongotau")
    client.user?.setPresence({ activities: [activity] })
    client.user?.setStatus("idle")
}

const gitUpdate = () => {
    try {
        execSync("git stash")
        execSync("git pull --force");
        console.log('Git pull successful.');
        console.log('Resetting local changes...');
        execSync("git reset --hard");
    } catch (error:any) {
        console.error('Error updating project from Git:', error);
    }
}

const manualUpdate = async () => {
    try {
        const headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'};
        const res = await axios.get(`https://github.com/LongAKolangle/discord-owo-selfbot/archive/master.zip`, {
            responseType: "arraybuffer",
            headers
        });
        const updatePath = path.resolve(global.FolderPath, "updateCache.zip");
        fs.writeFileSync(updatePath, res.data);

        const zip = new admZip(updatePath);
        const zipEntries = zip.getEntries();
        zip.extractAllTo(os.tmpdir(), true);
        const updatefolder = path.join(os.tmpdir(), zipEntries[0].entryName);
        if(!fs.existsSync(updatefolder)) throw new Error("Failed To Extract Files");
        copyDirectory(updatefolder, process.cwd());

    } catch (error:any) {
        console.error('Error updating project from GitHub:', error);
    }
}

const checkUpdate = async () => {
    try {
        const headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'};
        const response = await axios.get(`https://raw.githubusercontent.com/LongAKolangle/discord-owo-selfbot/main/package.json`, {
            headers
        });
        const ghVersion = response.data.version;
        const { version } = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8"));
        if (ghVersion > version) {
            const confirm = await getResult(trueFalse("Newer Version Detected, Do You Want To Update"));
            if(confirm) {
                log("Please Be Patient While We Are Updating The Client.", "i");
                await sleep(2000);
                if(fs.existsSync(".git")) {
                    try {
                        execSync("git --version");
                        log('Updating with Git...', "i");
                        gitUpdate();
                    } catch (error) {
                        log('Git is not installed on this device. Updating files individually...', "i");
                        await manualUpdate();
                    }
                }
                else await manualUpdate();
                log("Update Completed, Attempting To Install Libraries", "i");
                try {
                    execSync("npm install");
                    log("Libraries Installed, Restarting Selfbot", "i");
                    await sleep(5000);
                    const child_process = spawn("node .", [process.cwd()], {
                        shell: true,
                        detached: true,
                        stdio: "ignore"
                    });
                    child_process.unref();
                    process.exit(1);
                } catch (error) {
                    log("Failed To Install Libraries", "e");
                }
            }
            else log("Update Cancelled", "i");
        }
        else log("No Update Found", "i");
    } catch (error) {
        console.log(error);
        log("Failed To Check For Update", "e");
    }
}

export { timeHandler, consoleNotify, commandHandler, accountCheck, accountRemove, reloadPresence, checkUpdate, mapInt, send, sleep, shuffleArray, ranInt }