import inquirer from "inquirer";
import fs from "fs";
import * as discord from "discord.js-selfbot-v13";
/**
 * Prompt the question (or text and question) and wait for the user input
 * Require async and await for this function
 * @param {Object} question An object of question to prompt to the user 
 * @param {String} txt Text to print to console before prompting question
 * @returns the user answer (string, number,...)
 */
export function getResult(question, txt) {
    console.clear;
    if(txt) console.log(txt);
    if(typeof question == "object") {
        if(!question.name) question.name = "name"
    }
    if(!question.message.endsWith(": ")) question.message += ": "
    return new Promise((resolve) => {
        inquirer
            .prompt([question])
            .then((res) => {
            resolve(res.answer);
        });
    });
};

export function trueFalse(question, defaultValue = true) {
    return {
        type: "confirm",
        message: question,
        default: defaultValue
    }
}

export function listCheckbox(type, question, choice, loop = false, size = 10) {
    return {
        type: type,
        message: question,
        choices: choice,
        loop: loop,
        pageSize: size
    }
}

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

/**
 * Types of console log
 * @param {*} text Text to be printed
 * @param {*} type 
 * 
 * ```u```: Unknown (will not be printed)
 * 
 * ```s```: Sent (Default)
 * 
 * ```i```: Info
 * 
 * ```a```: Alert
 * 
 * ```e```: Error
 */
export function log(text, type = "s" ) {
    if (type == "u") type = "\x1b[93m[UNKNOWN]"
    else if (type == "s") type = "\x1b[92m[SENT]"
    else if (type == "i") type = "\x1b[34m[INFO]"
    else if (type == "a") type = "\x1b[31m[ALERT]"
    else if (type == "e") type = "\x1b[35m[ERROR]"
    else type = "\x1b[36m" + `[${type.toUpperCase()}]`
    console.log("\x1b[43m" + new Date().toLocaleTimeString('VN') + "\x1b[0m " + type + "\x1b[0m " + text)
}