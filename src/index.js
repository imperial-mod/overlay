/*
    Copyright (C) 2021  zani

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const fs = require("fs")
const os = require("os")
const path = require("path")
const api = require("./api")
const { shell } = require("electron")

const colors = {
    "DARK_RED": "#AA0000",
    "RED": "#FF5555",
    "GOLD": "#FFAA00",
    "YELLOW": "#FFFF55",
    "DARK_GREEN": "00AA00",
    "GREEN": "#55FF55",
    "AQUA": "#55FFFF",
    "DARK_AQUA": "#00AAAA",
    "DARK_BLUE": "#0000AA",
    "BLUE": "#5555FF",
    "LIGHT_PURPLE": "#FF55FF",
    "DARK_PURPLE": "#AA00AA",
    "WHITE": "#FFFFFF",
    "GRAY": "#AAAAAA",
    "DARK_GRAY": "#555555",
    "BLACK": "#000000"
}

const ranks = {
    "SUPERSTAR": `<span style="color: {monthly_color}">[MVP</span>{plus_color}{plus_color}<span style="color: {monthly_color}">] `,
    "MVP_PLUS": `<span style="color: ${colors["AQUA"]}">[MVP</span>{plus_color}<span style="color: ${colors["AQUA"]}">] `,
    "MVP": `<span style="color: ${colors["AQUA"]}">[MVP] `,
    "VIP_PLUS": `<span style="color: ${colors["GREEN"]}">[VIP</span><span style="color: ${colors["GOLD"]}">+</span><span style="color: ${colors["GREEN"]}">] `,
    "VIP": `<span style="color: ${colors["GREEN"]}">[VIP] `,
    "NON": `<span style="color: ${colors["GRAY"]}">`
}

window.addEventListener("load", () => {
    const userList = document.querySelector("#users")

    const folderPath = path.join(os.homedir(), "/duels_overlay")
    const configPath = path.join(folderPath, "config.json")
    const mcApi = new api.McAPI()

    let lastLog = []
    let changedLogs = []
    let logs = []
    let users = []

    let config = {
        user: "",
        apiKey: "",
        minecraftPath: ""
    }

    let hypixelApi
    let logPath = ""

    if (fs.existsSync(folderPath)) {
        config = JSON.parse(fs.readFileSync(configPath, {encoding: "utf8"}))

        console.log(config)

        hypixelApi = new api.HypixelAPI(config.apiKey)
        logPath = path.join(config.minecraftPath, "/logs/latest.log")

        fs.watchFile(logPath, {persistent: true, interval: 4}, (curr, prev) => {
            const logFile = fs.readFileSync(logPath, {encoding: "utf8"})

            logs = logFile.split("\n")

            if (lastLog.length > 0) {
                for (let i = 0; i < logs.length; i++) {
                    if (logs[i] != lastLog[i]) {
                        changedLogs.push(logs[i])
                    }
                }
            }

            lastLog = logs

            for (const latestLog of changedLogs) {
                if (/\[[^]*\] \[Client thread\/INFO\]: \[CHAT\] [^]*/.test(latestLog)) {
                    const message = latestLog.split("[CHAT] ")[1].trim()

                    if (/Sending you to (.*)!/.test(message)) {
                        console.log(message)

                        users = []
                        for (const element of userList.children) {
                            if (element.id == "user")
                                element.remove()
                        }
                    }

                    if (/(.*) joined \((\d)\/(\d)\)!/.test(message)) {
                        const name = message.split(" ")[0]
                        console.log(name)
                        if (!users.includes(name)) {
                            mcApi.getUuid(name).then(uuid => {
                                hypixelApi.getPlayer(uuid).then(async (res) => {
                                    const player = res.player

                                    console.log(player)
                                    const guild = await hypixelApi.getGuild(uuid)

                                    const userElement = document.createElement("tr")

                                    const nameElement = document.createElement("td")
                                    const wlrElement = document.createElement("td")
                                    const kdrElement = document.createElement("td")
                                    const bwsElement = document.createElement("td")
                                    const wsElement = document.createElement("td")

                                    console.log(guild)

                                    if (player) {
                                        const bws = player.stats["Duels"]["best_overall_winstreak"]
                                        const ws = player.stats["Duels"]["current_winstreak"]
                                        const wlr = Math.round((player.stats["Duels"]["wins"]/player.stats["Duels"]["losses"])*100)/100
                                        const kdr = Math.round((player.stats["Duels"]["kills"]/player.stats["Duels"]["deaths"])*100)/100

                                        nameElement.innerHTML = `${ranks[player.monthlyPackageRank == "SUPERSTAR" ? "SUPERSTAR" : undefined || player.newPackageRank || "NON"].replaceAll("{plus_color}", `<span style="color: ${colors[player.rankPlusColor || "RED"]};">+</span>`)}${name}</span>`.replaceAll("{monthly_color}", player["monthlyRankColor"] || "GOLD")
                                        if (guild && guild.tag) {
                                            nameElement.innerHTML += ` <span style="color: ${colors[guild.tagColor] || colors["GRAY"]};">[${guild.tag}]</span>`
                                        }
                                        wlrElement.innerText = wlr || "N/A"
                                        kdrElement.innerText = kdr || "N/A"
                                        bwsElement.innerText = bws || "N/A"
                                        wsElement.innerText = ws || "N/A"
                                    } else {
                                        nameElement.innerHTML = `<span style="color: ${colors["RED"]};">${name} (NICKED)</span>`
                                    }

                                    userElement.append(nameElement)
                                    userElement.append(wlrElement)
                                    userElement.append(kdrElement)
                                    userElement.append(bwsElement)
                                    userElement.append(wsElement)
                                    userElement.id = "user"

                                    userList.append(userElement)

                                    users.push(name)
                                })
                            })
                        }
                    }
                }
            }

            changedLogs = []
        })
    } else {
        fs.mkdirSync(folderPath, {recursive: true})
        fs.writeFileSync(configPath, JSON.stringify(config, true, 4))
        shell.openExternal(`file://${configPath}`)
    }
})