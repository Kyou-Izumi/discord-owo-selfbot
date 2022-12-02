import fs from "fs";
import * as discord from "discord.js-selfbot-v13";
import axios from "axios"
import stream from "stream"
import util from "util"
import path from "path";

export function accountCheck(token) {
    const client = new discord.Client({
        checkUpdate: false
    })
    return new Promise(async (res) => {
        client.once("ready", () => {
            res(client)
        })
        try {
            token ? await client.login(token) : client.QRLogin() 
        } catch (error) {
            res("Invalid Token")
        }
    })
}

export function accountRemove(id, DataPath, data) {
    delete data[id];
    fs.writeFileSync(DataPath, JSON.stringify(data), "utf8")
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 
 * @param {"get"|"request"|"post"} type 
 * @param {*} URL 
 * @param {*} option 
 */
export async function webAccess(type, URL, option = {}) {
    const config = {
        method: type,
        url: URL,
        option
    }
    return new Promise(async (resolve, reject) => {
        const response = await axios(config).catch(reject)
        if(response) resolve(response.data)
    })
    
}

export async function downloadFile(URL, path) {
    const pipeline = util.promisify(stream.pipeline);
    const data = await webAccess("get", URL, {
        responseType: "stream"
    });
    await pipeline(data, fs.createWriteStream(path));
    return true;
}

export function base64_encode(file) {
    const bitmap = fs.readFileSync(path.resolve(file));
    const b64_ = Buffer.from(bitmap, "binary").toString("base64");
    return b64_;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}