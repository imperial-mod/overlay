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

const fetch = require("node-fetch"),
    sha1 = require("sha1"),
    fs = require("fs").promises

class McAPI {
    constructor() {

    }

    getStatus = async () => {
        const res = await fetch("https://status.mojang.com/check")

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return { status: res.status, text: body, json }
    }

    getUuid = async (username) => {
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json.id
    }

    getHistory = async (uuid) => {
        const res = await fetch(`https://api.mojang.com/user/profiles/${uuid}/names`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json
    }

    getProfile = async (uuid) => {
        const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            try {
                json = JSON.parse(body)
            } catch {

            }
        }

        try {
            const texture = JSON.parse(Buffer.from(json.properties[0].value, "base64").toString("utf8"))
            const skinUrl = texture.textures.SKIN
            const capeUrl = texture.textures.CAPE

            let cape = undefined
            let skin = undefined
            let skinHash = undefined
            let capeHash = undefined

            if (skinUrl) {
                const skinRes = await fetch(skinUrl.url)

                skin = await skinRes.buffer()
                skinHash = sha1(skin)
            }
            
            if (capeUrl) {
                const capeRes = await fetch(capeUrl.url)

                cape = await capeRes.buffer()
                capeHash = sha1(cape)
            }

            if (cape && skin) {
                return { id: json.id, name: json.name, properties: json.properties, texture, cape, capeHash, skin, skinHash, success: true}
            } else if (skin) {
                return { id: json.id, name: json.name, properties: json.properties, texture, skin, skinHash, success: true}
            } else if (cape) {
                return { id: json.id, name: json.name, properties: json.properties, texture, cape, capeHash, success: true}
            } else {
                return { id: json.id, name: json.name, properties: json.properties, texture, cape, capeHash, skin, skinHash, success: true}
            }
        } catch {
            return { success: false }
        }
    }
}

class HypixelAPI {
    constructor(key) {
        this.key = key
    }

    getPlayer = async (uuid) => {
        const res = await fetch(`https://api.hypixel.net/player?key=${this.key}&uuid=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json
    }

    getGuild = async (uuid) => {
        const res = await fetch(`https://api.hypixel.net/guild?key=${this.key}&player=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json.guild
    }

    getPlayerCount = async () => {
        const res = await fetch(`https://api.hypixel.net/playerCount?key=${this.key}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json.playerCount
    }

    getStatus = async (uuid) => {
        const res = await fetch(`https://api.hypixel.net/status?key=${this.key}&uuid=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json.status
    }

    getLeaderboards = async () => {
        const res = await fetch(`https://api.hypixel.net/leaderboards?key=${this.key}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json.leaderboards
    }

    getRecentGames = async (uuid) => {
        const res = await fetch(`https://api.hypixel.net/recentGames?key=${this.key}&uuid=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json.recentGames
    }

    getGetWatchdogStats = async () => {
        const res = await fetch(`https://api.hypixel.net/watchdogstats?key=${this.key}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json.watchdogstats
    }

    getFriends = async (uuid) => {
        const res = await fetch(`https://api.hypixel.net/friends?key=${this.key}&uuid=${uuid}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json.records
    }

    getKeyInfo = async () => {
        const res = await fetch(`https://api.hypixel.net/key?key=${this.key}`)

        const body = await res.text()
        let json = {}

        if (res.status == 200) {
            json = JSON.parse(body)
        }

        return json
    }
}

module.exports = {
    McAPI: McAPI,
    HypixelAPI: HypixelAPI
}