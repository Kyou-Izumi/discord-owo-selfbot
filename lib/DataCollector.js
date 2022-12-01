import { getResult } from "./inquirer"

function getToken() {
    const res = {
        type: "input",
        validate(token){
            return token.split(".").length === 3 ? true : "Invalid Token"
        },
        message: "Enter Your Token"
    }
}