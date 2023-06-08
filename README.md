# ADVANCED DISCORD OWO TOOL FARM

This is a community version and currently in progress

Please report bugs and keep on track with our announcement!

## Requirement
__Node.js Version:__ At least v14.0.0 or higher

For laptop and PC: Windows 8/8.1/10 or higher, Linux and MacOS

For Android: Download and install [Termux](https://f-droid.org/en/packages/com.termux/) 

For IOS: Not yet (please tell us if you know any supporting method)

__Note:__ Termux from Google Play Store is unsupported.

If you are using Termux and notification via playing music, please download __termux-api__ package to be installed for the `termux-media-player` command to work

This can be done by running command:
```bash
pkg install termux-api
```

## Installation
Please make sure that you have installed [Node.js](https://nodejs.org/en/download) on your devices

![Imgur](https://i.imgur.com/swvzF0k.png)

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

We support 3 ways to login: via token, via QR Code, and via Password

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

### Via Password

Simply submit your Email/Phone Number, Password, MFA Code (Backup/3rd party app Code)

__Note:__ We do __NOT__ support code auth via Phone Number/Email, __ONLY__ Backup / Google Authenticator Code
## Caution
Recently, there have been reports of hacked accounts and lost currency associated with the use of certain tools. For your safety, it is advised to avoid any kind of obfuscated or suspicious code. Prioritize security and exercise caution when using external code or tools. Stay informed, trust reliable sources, and adopt good security practices to protect your accounts and data.

![Imgur](https://i.imgur.com/dWFr5uv.png)
## Achievements
✔ Attempt to solve captcha by using 3rd party captcha-api website

✔ Solve captcha by DMs selfbot account

✔ Use Slash Command

✔ Selfbot Commands

✔ Send notification via webhook/DMs/Call

✔ Cool Activities

✔ Prompt sent command with time

✔ Level up with random quotes from 3rd party web-api

✔ Unhandled Rejection Handler

✔ Double/Triple spam error Handler

✔ Automatic resume on captcha solved

✔ Automatic loot boxes and use gems

✔ Automatic run/pup/piku randomly

✔ Automatic claim daily reward

✔ Automatic reset configuration daily

✔ Automatic check for update

✔ Clean code

✔ Open source

__-- Coming soon list --__

⬜ Selfbot captcha solving API (No longer 3rd party)

⬜ Huntbot captcha solving API (No longer 3rd party)

⬜ Automatic send/receive huntbot

⬜ Automatic vote OwO on top.gg

⬜ Automatic claim/handle quest and checklog

⬜ Application with UI support

## Sparkling Soul

We greatly appreciate your support and consideration! Your belief in the power of a star as a donation truly resonates with us. Each click represents not just a simple action, but a meaningful contribution towards our journey.

Your stars serve as fuel for our spirits, igniting our passion and dedication to make a positive impact. With every milestone we achieve, we come closer to realizing our vision of creating a better non-profit endeavors.

Your stars inspire us to keep pushing boundaries, overcome challenges, and bring about meaningful change.

⭐ 10 stars: 2023/04/15

⭐ 20 stars: 2023/06/03

⭐ 25 stars: 2023/06/06

⬜ 50 stars:

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

As we are looking for translators to make the selfbot and instruction multi-language supports, please open an issue with translator labels if you'd like to join in!

Please make sure to update tests as appropriate.

## Contact

__Facebook:__ Coming soon 

__Email:__ ntt.eternity2k6@gmail.com

__Discord (semi-support):__ [Join now](https://discord.gg/frdNVtXUdN)

__Join our discord server:__ [Join now](https://discord.gg/Yr92g5Zx3e)

    Hello there, my name is Eternityy, and I wanted to take a moment to thank you for using our tool.

    Since 2021, this project has been non-profit. But we're still committed to making it the best it can be, 
    
    With APIs like captcha-solving and quoting,... to help make your experience better and more efficient.

    Unfortunately, funding has become an obstacle to our progress. Would you be willing to help us out with a small donation? 
    
    Even the price of a coffee cup can go a long way towards keeping us going. Every little bit helps, means the world to us.

    Thank you for your time and consideration, and we hope you continue to enjoy our tool!

#### MB Bank Vietnam / Momo / ZaloPay: __NGUYEN THANH LONG__ __0978176370__


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
