const colors = require("../../constants.json").colors
const threatColors = require("../../constants.json").threatColors
const threatNames = require("../../constants.json").threatNames
const prestiges = require("../../prestiges.json").Bedwars
const util = require("../util")

module.exports = {
    stats: [
        "Threat",
        "Level",
        "WLR",
        "FKDR",
        "BBLR",
        "WS",
        "Wins",
    ],
    getStats: (player, mode, numberFormatter) => {
        const stats = []

        const star = player["achievements"]["bedwars_level"]
        const wins = player.stats["Bedwars"]["wins_bedwars"]
        const losses = player.stats["Bedwars"]["losses_bedwars"]
        const finalKills = player.stats["Bedwars"]["final_kills_bedwars"]
        const finalDeaths = player.stats["Bedwars"]["final_deaths_bedwars"]
        const bedsBroken = player.stats["Bedwars"]["beds_broken_bedwars"]
        const bedsLost = player.stats["Bedwars"]["beds_lost_bedwars"]
        const ws = player.stats["Bedwars"]["winstreak"]

        const wlr = Math.round((wins / losses) * 100) / 100 || wins
        const fkdr = Math.round((finalKills / finalDeaths) * 100) / 100 || finalKills
        const bblr = Math.round((bedsBroken / bedsLost) * 100) / 100 || bedsBroken

        let threatLevel = 0
        let wlrThreat = 0
        let fkdrThreat = 0
        let bblrThreat = 0
        let wsThreat = 0

        console.log()

        if (wlr >= 5) {
            wlrThreat = 3
            threatLevel += 3
        } else if (wlr >= 2.5) {
            wlrThreat = 2
            threatLevel += 2
        } else if (wlr >= 1.25) {
            wlrThreat = 1
            threatLevel++
        }

        if (fkdr >= 10) {
            fkdrThreat = 3
            threatLevel += 3
        } else if (fkdr >= 5) {
            fkdrThreat = 2
            threatLevel += 2
        } else if (fkdr >= 2.5) {
            fkdrThreat = 1
            threatLevel++
        }

        if (bblr >= 5) {
            bblrThreat = 3
            threatLevel += 3
        } else if (bblr >= 2.5) {
            bblrThreat = 2
            threatLevel += 2
        } else if (bblr >= 1.25) {
            bblrThreat = 1
            threatLevel++
        }

        if (ws >= 50) {
            wsThreat = 3
            threatLevel += 3
        } else if (ws >= 25) {
            wsThreat = 2
            threatLevel += 2
        } else if (wlr >= 5) {
            wsThreat = 1
            threatLevel++
        }

        const overallThreatLevel = Math.round(threatLevel / 4)
        const prestige = util.getPrestige(star, 100, prestiges)

        stats.push(`<span style="color: ${colors[threatColors[overallThreatLevel]]}">${threatNames[overallThreatLevel]}</span>`)
        stats.push(util.formatPrestige(star, prestige))
        stats.push(`<span style="color: ${colors[threatColors[wlrThreat]]};">${numberFormatter.format(wlr) || "N/A"}</span>`)
        stats.push(`<span style="color: ${colors[threatColors[fkdrThreat]]};">${numberFormatter.format(fkdr) || "N/A"}</span>`)
        stats.push(`<span style="color: ${colors[threatColors[bblrThreat]]};">${numberFormatter.format(bblr) || "N/A"}</span>`)
        stats.push(`<span style="color: ${colors[threatColors[wsThreat]]};">${numberFormatter.format(ws) || "N/A"}</span>`)
        stats.push(`<span style="color: ${colors["GRAY"]};">${numberFormatter.format(wins) || "N/A"}</span>`)

        return stats
    }
}