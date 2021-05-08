const colors = require("../../constants.json").colors
const threatColors = require("../../constants.json").threatColors
const threatNames = require("../../constants.json").threatNames

module.exports = {
    stats: [
        "Threat",
        "WLR",
        "KDR",
        "WS",
        "BWS",
        "Aim",
        "Wins",
        "Losses"
    ],
    getStats: (player, mode, numberFormatter) => {
        mode = mode.split("_")[0].toLowerCase()

        const stats = []

        const wins = player.stats["Duels"][`${mode ? mode + "_duel_" : ""}wins`] || 0
        const losses = player.stats["Duels"][`${mode ? mode + "_duel_" : ""}losses`] || 0
        const bws = player.stats["Duels"][`best_${mode || "overall"}_winstreak`] || 0
        const ws = player.stats["Duels"][`current_${mode ? mode + "_" : ""}winstreak`] || 0
        const wlr = Math.round((wins / losses) * 100) / 100 || wins
        const kdr = Math.round((player.stats["Duels"][`${mode ? mode + "_duel_" : ""}kills`] / player.stats["Duels"][`${mode ? mode + "_duel_" : ""}deaths`]) * 100) / 100 || player.stats["Duels"]["kills"]
        const aim = Math.round(((player.stats["Duels"]["melee_hits"] / player.stats["Duels"]["melee_swings"]) * 100) * 100) / 100

        let threatLevel = 0
        let wlrThreat = 0
        let kdrThreat = 0
        let wsThreat = 0
        let bwsThreat = 0
        let aimThreat = 0

        console.log(player.stats["Duels"])

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

        const overallThreatLevel = Math.round(threatLevel / 5)

        stats.push(`<span style="color: ${colors[threatColors[overallThreatLevel]]}">${threatNames[overallThreatLevel]}</span>`)
        stats.push(`<span style="color: ${colors[threatColors[wlrThreat]]};">${numberFormatter.format(wlr)}</span>` || "N/A")
        stats.push(`<span style="color: ${colors[threatColors[kdrThreat]]};">${numberFormatter.format(kdr)}</span>` || "N/A")
        stats.push(`<span style="color: ${colors[threatColors[wsThreat]]};">${numberFormatter.format(ws)}</span>` || "N/A")
        stats.push(`<span style="color: ${colors[threatColors[bwsThreat]]};">${numberFormatter.format(bws)}</span>` || "N/A")
        stats.push(`<span style="color: ${colors[threatColors[aimThreat]]};">${aim}%</span>` || "N/A")
        stats.push(`<span style="color: ${colors["GRAY"]};">${numberFormatter.format(wins)}</span>`)
        stats.push(`<span style="color: ${colors["GRAY"]};">${numberFormatter.format(losses)}</span>`)

        return stats
    }
}