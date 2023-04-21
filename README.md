# ADVANCED DISCORD OWO TOOL FARM

This is a community version and currently in progress

Please report bugs and keep on track with our announcement!

## Requirement
For laptop and PC: Windows 10 or higher, Linux and MacOS

For Android: Download and install [Termux](https://f-droid.org/en/packages/com.termux/) 

For IOS: Not yet (please tell us if you know any supporting method)

__Note:__ Termux from Google Play Store is unsupported.

## Installation
Please make sure that you have installed both [Node.js](https://nodejs.org/en/download) and [Python3](https://www.python.org/downloads/) on your devices

An instruction on how to add Python to environment variables can be found [here](https://realpython.com/add-python-to-path/)

![Imgur](https://i.imgur.com/ZCqPkmX.png)

Download and extract the module or clone/pull it using [Git](https://git-scm.com/downloads):
```bash
git clone https://github.com/LongAKolangle/discord-owo-selfbot.git
```

Now [open the terminal inside folder](https://www.groovypost.com/howto/open-command-window-terminal-window-specific-folder-windows-mac-linux/) where you downloaded the selfbot and run the following command

```bash
npm install
```
This will install all the requirements (libraries) for the selfbot to run correctly
## Usage
For running selfbot, please use the following command (inside selfbot folder)
```bash
node .
```
If you see the following warning 

![Imgur](https://i.imgur.com/jSTfrOr.png)

Congratulation, you have installed our selfbot successfully.

Type "Y", enter and enjoy your time! (The selfbot will exit if you press enter only)

## Account Login

We support 2 ways to login: via token, and via QR Code

![Imgur](https://i.imgur.com/UwU9Z9B.png)

### Via token: 

#### __- Step 1: Get your discord account token__

Method 1: Follow [this instruction](https://pcstrike.com/how-to-get-discord-token/) to get your account token

Method 2: Press __Ctrl + Shift + I__ and paste the following function

```javascript
window.webpackChunkdiscord_app.push([
  [Math.random()],
  {},
  req => {
    for (const m of Object.keys(req.c)
      .map(x => req.c[x].exports)
      .filter(x => x)) {
      if (m.default && m.default.getToken !== undefined) {
        return copy(m.default.getToken());
      }
      if (m.getToken !== undefined) {
        return copy(m.getToken());
      }
    }
  },
]);
console.log('%cTOKEN CLAIMED!', 'font-size: 50px');
console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px');
```

#### __- Step 2: Simply paste your token into the toolfarm, this will take a while__

![Imgur](https://i.imgur.com/v7LlsSg.png)

### Via QR Code
Simply scan the QR Code on the screen by your discord mobile and wait patiently...

![Imgur](https://i.imgur.com/xm8F3Cy.png)

If success, a list of servers you joined will be shown up

__A full tutorial on how to use the selfbot will be uploaded to Youtube soon!__

## Achievements
✔ Attempt to solve captcha by using 3rd party captcha-api website

✔ Solve captcha by DMs the selfbot

✔ Send notification via webhook/DMs/Call

✔ Cool Activities

✔ Prompt sent command with time

✔ Level up with random quotes from 3rd party captcha-api website

✔ Unhandled Rejection Handler

✔ Double/Triple spam error Handler

✔ Automatic resume on captcha solved

✔ Automatic loot boxes and use gems

✔ Automatic run/pup/piku randomly

✔ Automatic claim daily reward

✔ Automatic reset configuration daily

✔ Clean code

__-- Coming soon list --__

⬜ Automatic send/receive huntbot

⬜ Automatic vote OwO on top.gg

⬜ Automatic claim/handle quest and checklog

⬜ Application with UI support

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

As we are looking for translators to make the selfbot and instruction multi-language supports, please open an issue with translator labels if you'd like to join in!

Please make sure to update tests as appropriate.

## Contact

Facebook: Coming soon 

Email: ntt.eternity2k6@gmail.com

Discord (semi-support): [Join now](https://discord.gg/frdNVtXUdN)

Join our discord server: Coming soon

## Acknowledgments
__SPECIAL THANKS TO:__

Aiko-chan-ai

iamz4ri

keepmeside

## License

✨ Licensed under the MIT license.

⛱️ Copyright © EternityVN x aiko-chan-ai 2022

💖 Made by Vietnamese with love

💫 We are BKI members (Baka Island - 💪Đảo Ngố Tàu) 

__Tag:__ Discord selfbot, OwO selfbot, Tool Farm OwO, Advanced OwO Selfbot, Selfbot Farm OwO, Discord OwO bot selfbot, Discord OwO selfbot, etc.
