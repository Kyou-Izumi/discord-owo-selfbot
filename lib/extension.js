import fs from "fs";
import * as discord from "discord.js-selfbot-v13";

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

export function accountRemove(id, DataPath, RawData) {
    delete RawData[1][id];
    fs.writeFileSync(DataPath, JSON.stringify(RawData), "utf8")
}

