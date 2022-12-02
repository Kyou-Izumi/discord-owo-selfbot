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
 */
 export function log(text, type = "s" ) {
    if (type == "u") type = "\x1b[93m[UNKNOWN]"
    else if (type == "s") type = "\x1b[92m[SENT]"
    else if (type == "i") type = "\x1b[34m[INFO]"
    else if (type == "a") type = "\x1b[31m[ALERT]"
    else if (type == "e") type = "\x1b[35m[ERROR]"
    else type = "\x1b[36m" + `[${type.toString().toUpperCase()}]`
    console.log("\x1b[43m" + new Date().toLocaleTimeString('VN') + "\x1b[0m " + type + "\x1b[0m " + text + "\x1b[0m")
}