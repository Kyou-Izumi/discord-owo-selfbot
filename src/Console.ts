import { Answers } from "inquirer";
import moment from "moment-timezone";
import { InquirerConfirmQuestion, InquirerQuestion } from "./lib/class.js";

type LogType = "u" | "s" | "i" | "a" | "e" | "PROMISE.ERROR"
const log = (text: string, type:LogType = "s") => {
    let logType:string;
    switch (type) {
        case "u":
            logType = "\x1b[93m[UNKNOWN]"
            break;
        case "i":
            logType = "\x1b[34m[INFO]";
            break;
        case "a":
            logType = "\x1b[31m[ALERT]";
            break;
        case "e":
            logType = "\x1b[35m[ERROR]";
            break;
        case "s":
            logType = "\x1b[92m[SENT]";
            break;
        default:            
            logType = "\x1b[36m" + `[${type.toUpperCase()}]`;
            break;
    }
    return console.log(`\x1b[43m${moment().format('YYYY-MM-DD HH:mm:ss')}\x1b[0m ${logType}\x1b[0m ${text}\x1b[0m`);
}

const getResult = <T extends Answers, U extends T[keyof T] = T[keyof T]> (question:InquirerQuestion<T, U>, text?:string) => {
    console.clear()
    if(text) console.log(text)
    return question.prompt();
}

const trueFalse = (question: string, defaultValue: boolean = true) => {
    return new InquirerConfirmQuestion<{answer: boolean}> ({
        type: "confirm",
        message: question,
        default: defaultValue
    })
}

export { getResult, trueFalse, log}