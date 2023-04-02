import fs from "fs";
import * as discord from "discord.js-selfbot-v13";
import Captcha from "2captcha"
import axios from "axios"
import { DataPath, global } from "../index.js";

export function accountCheck(token) {
    const client = new discord.Client({
        checkUpdate: false,
        autoRedeemNitro: true,
        patchVoice: true
    })
    return new Promise(async (res) => {
        client.once("ready", () => {
            res(client)
        })
        try {
            token ? await client.login(token) : client.QRLogin() 
        } catch (error) {
            res("Invalid Token, Please Login Again.")
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
            if(res) resolve(res)
        })
    }
};

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