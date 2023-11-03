import { NewsChannel, TextChannel } from "discord.js-selfbot-v13";
import inquirer, { Question, ListQuestion, CheckboxQuestion, InputQuestion, ConfirmQuestion } from "inquirer"

type Answers = Record<string, any>

class InquirerQuestion<T extends Answers = Answers, U = T[keyof T]> {
    private question: Question<T>;

    constructor(question: Question<T>) {
        if(!question.name) question.name = "answer";
        if(!question.message?.toString().endsWith(": ")) question.message += ": ";
        this.question = question;
    }

    async prompt(): Promise<U> {
        const answers = await inquirer.prompt([this.question])
        return answers[this.question.name as keyof T] as U;
    }
}

class InquirerListQuestion<T extends Answers = Answers, U = T[keyof T]> extends InquirerQuestion<T, U> {
    constructor(question: ListQuestion<T>) {
        super(question);
    }

    async prompt(): Promise<U> {
        const answer = await super.prompt();
        return answer as U;
    }
}

class InquirerCheckboxQuestion<T extends Answers = Answers, U = T[keyof T]> extends InquirerQuestion<T, U> {
    constructor(question: CheckboxQuestion<T>) {
        super(question);
    }

    async prompt(): Promise<U> {
        const answer = await super.prompt()
        return answer as U;
    }
}

class InquirerInputQuestion<T extends Answers = Answers, U = T[keyof T]> extends InquirerQuestion<T, U> {
    constructor(question: InputQuestion<T>) {
        super(question);
    }

    async prompt(): Promise<U> {
        const answer = await super.prompt();
        return answer as U;
    }
}

class InquirerConfirmQuestion<T extends Answers = Answers, U = T[keyof T]> extends InquirerQuestion<T, U> {
    constructor(question: ConfirmQuestion<T>) {
        super(question);
    }

    async prompt(): Promise<U> {
        const answer = await super.prompt();
        return answer as U
    }
}

interface Configuration {
    tag: string
    token: string
    guildID: string
    channelID: string[]
    wayNotify: number[]
    musicPath?: string
    webhookURL?: string
    userNotify?: string
    captchaAPI: number
    apiUser?: string
    apiKey?: string
    apiNCAI?: string
    cmdPrefix?: string
    autoPray: string[]
    autoGem: number
    autoCrate?: boolean
    autoHunt:boolean
    upgradeTrait?: number
    autoGamble: string[]
    gamblingAmount: string
    autoSell: boolean
    autoSlash: boolean
    autoQuote: boolean
    autoDaily: boolean
    autoOther: boolean
    autoSleep: boolean
    autoReload: boolean
    autoResume: boolean
}

interface Tool {
    owoID: string
    prefix: string[]
    FolderPath: string
    DataPath: string
    slashError: number
    startTime: number
    lastTime?: number
    reloadTime?: number
    totalcmd: number
    totaltxt: number
    paused: boolean
    captchaDetected: boolean
    channel: TextChannel | NewsChannel
    config: Configuration
    commands: {
        [key:string]: any
    }
}

const resolveData = (
    tag: string,
    token: string,
    guildID: string,
    channelID: string[],
    wayNotify: number[],
    musicPath: string,
    webhookURL: string,
    userNotify: string,
    captchaAPI: number,
    apiUser: string,
    apiKey: string,
    apiNCAI: string,
    cmdPrefix: string,
    autoPray: string[],
    autoGem: number,
    autoCrate: boolean,
    autoHunt: boolean,
    upgradeTrait: number,
    autoGamble: string[],
    gamblingAmount: string,
    autoSlash: boolean,
    autoQuote: boolean,
    autoDaily: boolean,
    autoSell: boolean,
    autoOther: boolean,
    autoSleep: boolean,
    autoReload: boolean,
    autoResume: boolean
) => {return {
    tag,
    token,
    guildID,
    channelID,
    wayNotify,
    musicPath,
    webhookURL,
    userNotify,
    captchaAPI,
    apiUser,
    apiKey,
    apiNCAI,
    cmdPrefix,
    autoPray,
    autoGem,
    autoCrate,
    autoHunt,
    upgradeTrait,
    autoGamble,
    gamblingAmount,
    autoSlash,
    autoQuote,
    autoDaily,
    autoSell,
    autoOther,
    autoSleep,
    autoReload,
    autoResume,
} as Configuration }

export type { Configuration, Tool}
export { InquirerQuestion, InquirerListQuestion, InquirerInputQuestion, InquirerCheckboxQuestion, InquirerConfirmQuestion, resolveData }