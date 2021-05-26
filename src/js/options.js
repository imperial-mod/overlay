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
const mcPath = path.join(require("minecraft-folder-path"), "logs")

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
    const blcRadio = document.querySelector("#blc")
    const loungeRadio = document.querySelector("#lounge")
    const nodejsVer = document.querySelector("#nodejs-ver")
    const proxyToggle = document.querySelector("#proxy")
    const proxyInfo = document.querySelector("#proxy-info")
    const presence = document.querySelector("#presence")
	const mojang = document.querySelector("#mojang")
	const microsoft = document.querySelector("#microsoft")

    let client = "vanilla"
	let auth = "mojang"

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
        proxyToggle.checked = config.proxy || false
        presence.checked = config.presence

        if (proxyToggle.checked) {
            proxyInfo.innerText = `Connect to Hypixel with localhost:25566 to use the proxy.`
        }

		client = config.client || "vanilla"
		auth = config.auth || "mojang"

        vanillaRadio.checked = (config.client || "vanilla") == "vanilla"
        lunarRadio.checked = (config.client || "vanilla") == "lunar"
        blcRadio.checked = (config.client || "vanilla") == "blc"
        loungeRadio.checked = (config.client || "vanilla") == "lounge"

		mojang.checked = (config.auth || "mojang") == "mojang"
		microsoft.checked = (config.auth || "mojang") == "microsoft"
    } else {
        mcDir.value = mcPath.replaceAll("\\", "/")
        vanillaRadio.checked = true
    }

    lunarRadio.addEventListener("change", () => {
        if (lunarRadio.checked) {
            mcDir.value = path.join(os.homedir(), "/.lunarclient/offline/1.8/logs").replaceAll("\\", "/")
            client = "lunar"
        }
    })

    vanillaRadio.addEventListener("change", () => {
        if (vanillaRadio.checked) {
            mcDir.value = mcPath.replaceAll("\\", "/")
            client = "vanilla"
        }
    })

    blcRadio.addEventListener("change", () => {
        if (blcRadio.checked) {
            mcDir.value = path.join(mcPath, "blclient/minecraft").replaceAll("\\", "/")
            client = "blc"
        }
    })

    loungeRadio.addEventListener("change", () => {
        if (loungeRadio.checked) {
            mcDir.value = path.join(mcPath, "../../.pvplounge/logs").replaceAll("\\", "/")
            client = "lounge"
        }
    })

    proxyToggle.addEventListener("change", () => {
        proxyInfo.innerText = ""
        if (proxyToggle.checked) {
            proxyInfo.innerText = `Connect to Hypixel with localhost:25566 to use the proxy.`
        }
    })

	mojang.addEventListener("change", () => {
		if (mojang.checked) {
			auth = "mojang"
		}
	})

	microsoft.addEventListener("change", () => {
		if (microsoft.checked) {
			auth = "microsoft"
		}
	})

    saveButton.addEventListener("click", () => {
        fs.mkdirSync(folderPath, {recursive: true})
        fs.writeFileSync(configPath, JSON.stringify({
            user: mcUser.value,
            apiKey: apiKey.value,
            minecraftPath: mcDir.value,
            youTag: youTag.checked,
            proxy: proxyToggle.checked,
            presence: presence.checked,
			auth,
            client
        }, true, 4))
        window.location.href = "./index.htm"
    })
})