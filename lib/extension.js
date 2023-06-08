import fs from "fs";
import * as discord from "discord.js-selfbot-v13";
import Captcha from "2captcha"
import axios from "axios"
import { DataPath, FolderPath, global } from "../index.js";
import { log } from "./console.js";
import { getResult, trueFalse } from "./prompt.js";
import path from "path";
import { execSync, spawn } from "child_process";
import admZip from "adm-zip"
import os from "os"

export function accountCheck(input) {
    const client = new discord.Client({
        checkUpdate: false,
        autoRedeemNitro: true,
        patchVoice: true,
        syncStatus: false
    })
    return new Promise(async (res) => {
        client.once("ready", () => {
            res(client)
        });
        try {
            if(typeof input == "string") await client.login(input)
            else if(typeof input == "object") await client.normalLogin(input[0], input[1], input[2])
            else client.QRLogin() 
        } catch (error) {
            res("Invalid Data, Please Login Again.")
        }
    })
}

export function accountRemove(id, data) {
    delete data[id];
    fs.writeFileSync(DataPath, JSON.stringify(data), "utf8")
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * 
 * @param {"get"|"request"|"post"} type 
 * @param {*} URL 
 * @param {*} option 
 */
export async function webAccess(method, url, data = {}, headers = {}) {
    const config = {
        method,
        url,
        headers,
    };

    if (method === 'get') {
        config.params = data;
    } else if (method === 'post') {
        if (headers['Content-Type'] === 'application/json') {
            config.data = data;
        } else {
            config.data = qs.stringify(data);
        }
    } else if (method === 'download') {
        const response = await axios.get(url, {
            responseType: "arraybuffer",
            headers: {
                ...headers,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Content-Type': 'application/octet-stream'
            }
        });
        const buffer = Buffer.from(response.data, "binary")
        return buffer.toString("base64");
    } 
    const response = await axios(config)
    return response.data
}

export function sleep(ms) {
    global.timer += ms;
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function solveCaptcha(url) {
    const processedData = await webAccess("download", url);
    if(global.config.captchaAPI === 1) {
        const obj = {
            userid: global.config.apiUser,
            apikey: global.config.apiKey,
            data: processedData,
        }
        return new Promise(async (resolve, reject) => {
            const res = await webAccess("post", "https://api.apitruecaptcha.org/one/gettext", obj, {"Content-Type": "application/json"}).catch(reject);
            if (res) resolve(res.result);
        });
    }
    else {
        return new Promise(async (resolve, reject) => {
            const solver = new Captcha.Solver(global.config.apiKey)
            const res = await solver.imageCaptcha(processedData).catch(reject)
            if(res) resolve(res.data)
        })
    }
};

export function reloadPresence(client) {
    const activity = new discord.RichPresence()
        .setApplicationId("817229550684471297")
        .setType("PLAYING")
        .setName("I AM ETERNITY")
        .setDetails("Simply fulfilling my duties")
        .setStartTimestamp(global.startTime)
        .setAssetsLargeImage("mp:icons/1112736528637108294/baf78d4a3b0892cc1f94c1e570371a94.webp")
        .setAssetsLargeText("You Dare Challenge me?")
        .setAssetsSmallImage("mp:avatars/749103042581889168/16f85900e27694838e415af9f039953a.webp")
        .setAssetsSmallText("BKI Eternity_VN")
        .addButton('Github', "https://github.com/LongAKolangle/discord-owo-selfbot")
        .addButton('Youtube', "https://youtube.com/@EternityNqu")
    client.user.setActivity(activity.toJSON())
    client.user.setStatus("idle")
}

/**
 * 
 * @param {Date} start 
 * The start time
 * @param {Date} end 
 * The end time
 * 
 */
export function timeHandler(start, end) {
    var ms = Math.abs(new Date(start) - new Date(end))
    var sec = Math.round((((ms % 86400000) % 3600000) % 60000) / 1000)
    var min =  Math.floor(((ms % 86400000) % 3600000) / 60000)
    var hour =  Math.floor((ms % 86400000) / 3600000)
    var day =    Math.floor(ms / 86400000)
    return ((day + (day > 1 ? " Days " : " Day ")) + hour + ":" + min + ":" + sec)
}

function getFiles(dir, suffix) {
    const files = fs.readdirSync(dir, {
        withFileTypes: true
    })

    let commandFiles = []

    for (const file of files) {
        if(file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                getFiles(path.resolve(dir, file.name), suffix)
            ]
        } else if(file.name.endsWith(suffix)) {
            commandFiles.push(path.resolve(dir, file.name))
        }
    }
    return commandFiles;
}

export async function commandHandler() {
    const suffix = ".js"
    const commandFiles = getFiles(path.resolve(process.cwd(), "commands"), suffix)
    for(const command of commandFiles) {
        let commandFile = await import(`file://${command}`)
        if(commandFile.default) commandFile = commandFile.default
        const commandName = path.basename(command).replace(suffix, "")
        global.commands[commandName.toLowerCase()] = commandFile
    }
}

function copyDirectory(sourceDir, destDir) {
    if(!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true});
    const files = fs.readdirSync(sourceDir)
    files.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        if(fs.statSync(sourcePath).isDirectory()) {
            copyDirectory(sourcePath, destPath);
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
    })
}

async function gitUpdate() {
    try {
        execSync("git stash")
        execSync("git pull --force");
        console.log('Git pull successful.');
        console.log('Resetting local changes...');
        execSync("git reset --hard");
    } catch (error) {
        console.error('Error updating project from Git:', error.message);
    }
}

async function manualUpdate() {
    try {
        const headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'};
        const res = await axios.get(`https://github.com/LongAKolangle/discord-owo-selfbot/archive/master.zip`, {
            responseType: "arraybuffer",
            headers
        });
        const updatePath = path.resolve(FolderPath, "updateCache.zip");
        fs.writeFileSync(updatePath, res.data);

        const zip = new admZip(updatePath);
        const zipEntries = zip.getEntries();
        zip.extractAllTo(os.tmpdir(), true);
        const updatefolder = path.join(os.tmpdir(), zipEntries[0].entryName);
        if(!fs.existsSync(updatefolder)) throw new Error("Failed To Extract Files");
        copyDirectory(updatefolder, process.cwd());

    } catch (error) {
        console.error('Error updating project from GitHub:', error.message);
    }
}

export async function checkUpdate() {
    try {
        const headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537'};
        const response = await axios.get(`https://raw.githubusercontent.com/LongAKolangle/discord-owo-selfbot/main/package.json`, headers);
        const ghVersion = response.data.version;
        const version = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"))).version;
        if (ghVersion > version) {
            const confirm = await getResult(trueFalse("Newer Version Detected, Do You Want To Update"));
            if(confirm) {
                log("Please Be Patient While We Are Updating The Client.", "i");
                await sleep(2000);
                if(fs.existsSync(".git")) {
                    try {
                        execSync("git --version");
                        log('Updating with Git...', "i");
                        await gitUpdate();
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
        await sleep(1000);
    } catch (error) {
        console.log(error);
        log("Failed To Check For Update", "e");
    }
}