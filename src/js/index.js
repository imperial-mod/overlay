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
const DiscordRPC = require("discord-rpc")
const package = require("../package.json")

const colors = require("./constants.json").colors

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

const threatColors = require("./constants.json").threatColors

const threatNames = require("./constants.json").threatNames

window.addEventListener("load", () => {
    const userList = document.querySelector("#users")
    const rpc = new DiscordRPC.Client({ transport: "ipc" })

    userList.style.visibility = "visible"

    const folderPath = path.join(os.homedir(), "/duels_overlay")
    const configPath = path.join(folderPath, "config.json")
    const mcApi = new api.McAPI()
    const numberFormatter = new Intl.NumberFormat("en-US")

    let lastLog = []
    let changedLogs = []
    let logs = []
    let users = []
    let mode = null
    let game = null
    let statsFunction = () => {
        return []
    }

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

        const logReader = new LogReader(logPath, config.user)

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

                    if (name == config.user) {
                        const status = await hypixelApi.getStatus(uuid)

                        game = status.session.gameType
                        mode = status.session.mode

                        console.log(path.join(__dirname, `/js/games/${game.toLowerCase()}.js`))

                        if (fs.existsSync(path.join(__dirname, `/js/games/${game.toLowerCase()}.js`))) {
                            const statFile = require(`./js/games/${game.toLowerCase()}`)
                            const usersHeader = document.querySelector("#users-header")
                            const userHeaderCatergories = document.querySelectorAll("#users-header > *")
                            const statCategories = ["Name"]

                            statCategories.push(...statFile.stats)

                            console.log(statCategories)
                            console.log(statFile)

                            statsFunction = statFile.getStats

                            for (const element of userHeaderCatergories) {
                                element.remove()
                            }

                            for (const category of statCategories) {
                                const element = document.createElement("td")
                                element.innerText = category
                                usersHeader.appendChild(element)
                            }
                        } else {
                            const usersHeader = document.querySelector("#users-header")
                            const userHeaderCatergories = document.querySelectorAll("#users-header > *")
                            const statCategories = ["Name"]

                            for (const element of userHeaderCatergories) {
                                element.remove()
                            }

                            for (const category of statCategories) {
                                const element = document.createElement("td")
                                element.innerText = category
                                usersHeader.appendChild(element)
                            }

                            statsFunction = () => {
                                return []
                            }
                        }
                    }
                    console.log(mode)
                    console.log(player)

                    const userElement = document.createElement("tr")
                    const nameElement = document.createElement("td")

                    if (player) {
                        const guild = await hypixelApi.getGuild(uuid)
                        const rank = player.rank || (player.monthlyPackageRank == "SUPERSTAR" ? "SUPERSTAR" : undefined || player.newPackageRank || "NON")

                        if (config.youTag && name == config.user) {
                            nameElement.innerHTML = `<span style="color: ${colors.AQUA};">[Y]</span> `
                        }

                        nameElement.innerHTML += `${ranks[rank].replaceAll("{plus_color}", `<span style="color: ${colors[player.rankPlusColor || "RED"]};">+</span>`)}${name}</span>`.replaceAll("{monthly_color}", player.monthlyRankColor || "GOLD")
                        if (guild && guild.tag) {
                            nameElement.innerHTML += ` <span style="color: ${colors[guild.tagColor] || colors["GRAY"]};">[${guild.tag}]</span>`
                        }

                        const stats = statsFunction(player, mode, numberFormatter)

                        console.log(stats)

                        userElement.append(nameElement)

                        for (const stat of stats) {
                            const element = document.createElement("td")
                            element.innerHTML = stat
                            userElement.append(element)
                        }
                    } else {
                        nameElement.innerHTML = `<span style="color: ${colors["RED"]};">${name} (NICKED)</span>`
                    }

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

        const startTimestamp = Date.now()

        const setRpc = async () => {
            const uuid = await mcApi.getUuid(config.user)

            const status = await hypixelApi.getStatus(uuid)

            console.log(status.session)

            if (status.session.online) {
                let gameChunks = status.session.gameType.split("_")
                let game = ""

                for (let chunk of gameChunks) {
                    console.log(chunk)
                    if (chunk)
                        game += chunk[0] + chunk.slice(1).toLowerCase() + " "
                }

                if (status.session.mode == "LOBBY") {
                    rpc.setActivity({
                        details: `In a ${game.trim()} Lobby`,
                        startTimestamp,
                        largeImageKey: "icon",
                        largeImageText: `Duels Overlay | v${package.version}`,
                        instance: false
                    })
                } else {
                    rpc.setActivity({
                        details: `Playing ${game.trim()}`,
                        startTimestamp,
                        largeImageKey: "icon",
                        largeImageText: `Duels Overlay | v${package.version}`,
                        instance: false
                    })
                }
            }
        }

        if (config.presence) {
            rpc.login({ clientId: "837192315453308948" })

            rpc.on("ready", () => {
                setRpc()

                setInterval(setRpc, 15e3)
            })
        }
    } else {
        window.location.href = "./options.htm"
    }
})