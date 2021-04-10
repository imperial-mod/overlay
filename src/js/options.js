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

const path = require("path")
const os = require("os")
const fs = require("fs")
const process = require("process")
const mcPath = require("minecraft-folder-path")

window.addEventListener("load", () => {
    const folderPath = path.join(os.homedir(), "/duels_overlay")
    const configPath = path.join(folderPath, "config.json")

    const saveButton = document.querySelector("#options-save")
    const mcUser = document.querySelector("#mc-user")
    const apiKey = document.querySelector("#api-key")
    const mcDir = document.querySelector("#mc-dir")
    const appVer = document.querySelector("#app-ver")
    const electronVer = document.querySelector("#electron-ver")
    const youTag = document.querySelector("#you-tag")
    const lunarRadio = document.querySelector("#lunar")
    const vanillaRadio = document.querySelector("#vanilla-forge")
    const nodejsVer = document.querySelector("#nodejs-ver")

    let client = "vanilla"

    const packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), {encoding: "utf8"}))

    appVer.innerText = `Duels Overlay v${packageInfo.version}`
    electronVer.innerText = `Electron v${process.versions.electron}`
    nodejsVer.innerText = `NodeJS v${process.versions.node}`

    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, {encoding: "utf8"}))

        mcUser.value = config.user || ""
        apiKey.value = config.apiKey || ""
        mcDir.value = config.minecraftPath || mcPath.replaceAll("\\", "/")
        youTag.checked = config.youTag || false

        vanillaRadio.checked = (config.client || "vanilla") == "vanilla"
        lunarRadio.checked = (config.client || "vanilla") == "lunar"
    } else {
        mcDir.value = mcPath.replaceAll("\\", "/")
    }

    lunarRadio.addEventListener("change", () => {
        if (lunarRadio.checked) {
            mcDir.value = path.join(os.homedir(), "/.lunarclient/offline/1.8").replaceAll("\\", "/")
            client = "lunar"
        }
    })

    vanillaRadio.addEventListener("change", () => {
        if (vanillaRadio.checked) {
            mcDir.value = mcPath.replaceAll("\\", "/")
            client = "vanilla"
        }
    })

    saveButton.addEventListener("click", () => {
        fs.mkdirSync(folderPath, {recursive: true})
        fs.writeFileSync(configPath, JSON.stringify({
            user: mcUser.value,
            apiKey: apiKey.value,
            minecraftPath: mcDir.value,
            youTag: youTag.checked,
            client
        }, true, 4))
        window.location.href = "./index.htm"
    })
})