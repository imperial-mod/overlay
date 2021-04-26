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
const api = require("./js/api")
const LogReader = require("./js/LogReader")
const { shell } = require("electron")

const colors = {
    "DARK_RED": "#AA0000",
    "RED": "#FF5555",
    "GOLD": "#FFAA00",
    "YELLOW": "#FFFF55",
    "DARK_GREEN": "#00AA00",
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
    "ADMIN": `<span style="color: ${colors["RED"]}">[ADMIN] `,
    "MODERATOR": `<span style="color: ${colors["DARK_GREEN"]}">[MOD] `,
    "HELPER": `<span style="color: ${colors["BLUE"]}">[HELPER] `,
    "YOUTUBER": `<span style="color: ${colors["RED"]}">[</span><span style="color: ${colors["WHITE"]}">YOUTUBE</span><span style="color: ${colors["RED"]}">] `,
    "SUPERSTAR": `<span style="color: {monthly_color}">[MVP</span>{plus_color}{plus_color}<span style="color: {monthly_color}">] `,
    "MVP_PLUS": `<span style="color: ${colors["AQUA"]}">[MVP</span>{plus_color}<span style="color: ${colors["AQUA"]}">] `,
    "MVP": `<span style="color: ${colors["AQUA"]}">[MVP] `,
    "VIP_PLUS": `<span style="color: ${colors["GREEN"]}">[VIP</span><span style="color: ${colors["GOLD"]}">+</span><span style="color: ${colors["GREEN"]}">] `,
    "VIP": `<span style="color: ${colors["GREEN"]}">[VIP] `,
    "NON": `<span style="color: ${colors["GRAY"]}">`
}

const threatColors = [
    "GREEN",
    "YELLOW",
    "RED",
    "DARK_PURPLE"
]

const threatNames = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "EXTREME"
]

window.addEventListener("load", () => {
    const userList = document.querySelector("#users")

    userList.style.visibility = "visible"

    const folderPath = path.join(os.homedir(), "/duels_overlay")
    const configPath = path.join(folderPath, "config.json")
    const mcApi = new api.McAPI()
    const numberFormatter = new Intl.NumberFormat("en-US")

    let lastLog = []
    let changedLogs = []
    let logs = []
    let users = []

    let config = {
        user: "",
        apiKey: "",
        minecraftPath: require("minecraft-folder-path")
    }

    let hypixelApi
    let logPath = ""

    if (fs.existsSync(folderPath)) {
        config = JSON.parse(fs.readFileSync(configPath, { encoding: "utf8" }))

        console.log(config)

        hypixelApi = new api.HypixelAPI(config.apiKey)
        logPath = path.join(config.minecraftPath, "latest.log")

        const logReader = new LogReader(logPath)

        logReader.on("server_change", () => {
            users = []
            for (const element of document.querySelectorAll(".user")) {
                element.remove()
            }
        })

        logReader.on("join", (name) => {
            console.log(name)
            mcApi.getUuid(name).then(uuid => {
                hypixelApi.getPlayer(uuid).then(async (res) => {
                    const player = res.player

                    console.log(player)
                    const guild = await hypixelApi.getGuild(uuid)

                    const userElement = document.createElement("tr")

                    const threatElement = document.createElement("td")
                    const nameElement = document.createElement("td")
                    const wlrElement = document.createElement("td")
                    const kdrElement = document.createElement("td")
                    const bwsElement = document.createElement("td")
                    const wsElement = document.createElement("td")
                    const winElement = document.createElement("td")
                    const lossElement = document.createElement("td")
                    const aimElement = document.createElement("td")

                    console.log(guild)

                    if (player && player.stats["Duels"]) {
                        const wins = player.stats["Duels"]["wins"] || 0
                        const losses = player.stats["Duels"]["losses"] || 0
                        const bws = player.stats["Duels"]["best_overall_winstreak"] || 0
                        const ws = player.stats["Duels"]["current_winstreak"] || 0
                        const wlr = Math.round((wins / losses) * 100) / 100 || wins
                        const kdr = Math.round((player.stats["Duels"]["kills"] / player.stats["Duels"]["deaths"]) * 100) / 100 || player.stats["Duels"]["kills"]
                        const aim = Math.round(((player.stats["Duels"]["melee_hits"] / player.stats["Duels"]["melee_swings"])*100)*100) / 100

                        let threatLevel = 0
                        let wlrThreat = 0
                        let kdrThreat = 0
                        let wsThreat = 0
                        let bwsThreat = 0
                        let aimThreat = 0

                        console.log(player.stats["Duels"])

                        const rank = player.rank || (player.monthlyPackageRank == "SUPERSTAR" ? "SUPERSTAR" : undefined || player.newPackageRank || "NON")

                        console.log(rank)
                        
                        if (wlr >= 15) {
                            threatLevel += 3
                            wlrThreat = 3
                        } else if (wlr >= 5) {
                            threatLevel += 2
                            wlrThreat = 2
                        } else if (wlr >= 2.5) {
                            threatLevel++
                            wlrThreat = 1
                        }

                        if (kdr >= 15) {
                            threatLevel += 3
                            kdrThreat = 3
                        } else if (kdr >= 10) {
                            threatLevel += 2
                            kdrThreat = 2
                        } else if (kdr >= 3) {
                            threatLevel++
                            kdrThreat = 1
                        }

                        if (ws >= 150) {
                            threatLevel += 3
                            wsThreat = 3
                        } else if (ws >= 50) {
                            threatLevel += 2
                            wsThreat = 2
                        } else if (ws >= 15) {
                            threatLevel++
                            wsThreat = 1
                        }

                        if (bws >= 150) {
                            threatLevel += 3
                            bwsThreat = 3
                        } else if (bws >= 50) {
                            threatLevel += 2
                            bwsThreat = 2
                        } else if (bws >= 20) {
                            threatLevel++
                            bwsThreat = 1
                        }

                        if (aim >= 70) {
                            threatLevel += 3
                            aimThreat = 3
                        } else if (aim >= 60) {
                            threatLevel += 2
                            aimThreat = 2
                        } else if (aim >= 40) {
                            threatLevel += 1
                            aimThreat = 1
                        }

                        const overallThreatLevel = Math.round(threatLevel/5)
                        nameElement.innerHTML = ""

                        if (config.youTag && name == config.user) {
                            nameElement.innerHTML = `<span style="color: ${colors.AQUA};">[Y]</span> `
                        }

                        nameElement.innerHTML += `${ranks[rank].replaceAll("{plus_color}", `<span style="color: ${colors[player.rankPlusColor || "RED"]};">+</span>`)}${name}</span>`.replaceAll("{monthly_color}", player.monthlyRankColor || "GOLD")
                        if (guild && guild.tag) {
                            nameElement.innerHTML += ` <span style="color: ${colors[guild.tagColor] || colors["GRAY"]};">[${guild.tag}]</span>`
                        }
                        threatElement.innerHTML = `<span style="color: ${colors[threatColors[overallThreatLevel]]}">${threatNames[overallThreatLevel]}</span>`
                        wlrElement.innerHTML = `<span style="color: ${colors[threatColors[wlrThreat]]};">${numberFormatter.format(wlr)}</span>` || "N/A"
                        kdrElement.innerHTML = `<span style="color: ${colors[threatColors[kdrThreat]]};">${numberFormatter.format(kdr)}</span>` || "N/A"
                        bwsElement.innerHTML = `<span style="color: ${colors[threatColors[bwsThreat]]};">${numberFormatter.format(bws)}</span>` || "N/A"
                        wsElement.innerHTML = `<span style="color: ${colors[threatColors[wsThreat]]};">${numberFormatter.format(ws)}</span>` || "N/A"
                        winElement.innerHTML = `<span style="color: ${colors["GRAY"]};">${numberFormatter.format(wins)}</span>`
                        lossElement.innerHTML = `<span style="color: ${colors["GRAY"]};">${numberFormatter.format(losses)}</span>`
                        aimElement.innerHTML = `<span style="color: ${colors[threatColors[aimThreat]]};">${aim}%</span>` || "N/A"
                    } else {
                        nameElement.innerHTML = `<span style="color: ${colors["RED"]};">${name} (NICKED)</span>`
                    }

                    userElement.append(threatElement)
                    userElement.append(nameElement)
                    userElement.append(wlrElement)
                    userElement.append(kdrElement)
                    userElement.append(aimElement)
                    userElement.append(bwsElement)
                    userElement.append(wsElement)
                    userElement.append(winElement)
                    userElement.append(lossElement)

                    userElement.className = "user"
                    userElement.id = `user-${name}`

                    userList.append(userElement)

                    users.push(name)
                })
            })
        })

        logReader.on("leave", (name) => {
            const element = document.querySelector(`#user-${name}`)
            if (element)
                element.remove()
        })
    } else {
        window.location.href = "./options.htm"
    }
})