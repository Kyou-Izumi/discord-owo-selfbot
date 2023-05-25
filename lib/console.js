import moment from "moment-timezone"
/**
 * Types of console log
 * @param {string} text Text to be printed
 * @param {"u"|"s"|"i"|"a"|"e"} type 
 * 
 * ```u```: Unknown
 * 
 * ```s```: Sent (Default)
 * 
 * ```i```: Info
 * 
 * ```a```: Alert
 * 
 * ```e```: Error
 **/
 export function log(text, type = "s" ) {
    switch (type) {
        case "u":
            type = "\x1b[93m[UNKNOWN]"
            break;
        case "i":
            type = "\x1b[34m[INFO]"
            break;
        case "a":
            type = "\x1b[31m[ALERT]"
            break;
        case "e":
            type = "\x1b[35m[ERROR]"
            break;
        case "s":
            type = "\x1b[92m[SENT]"
            break;
        default:
            type = "\x1b[36m" + `[${type.toString().toUpperCase()}]`
            break;
    }
    console.log("\x1b[43m" + moment().format('YYYY-MM-DD HH:mm:ss') + "\x1b[0m " + type + "\x1b[0m " + text + "\x1b[0m")
}