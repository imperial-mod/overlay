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

const util = require("../util")
const colors = require("../../constants.json").colors
const threatColors = require("../../constants.json").threatColors
const threatNames = require("../../constants.json").threatNames
const prestiges = require("../../prestiges.json").Skywars

module.exports = {
	stats: [
		"Threat",
		"Level",
		"WLR",
		"KDR",
		"Last ELO",
		"Last Pos",
		"Last Div"
	],
	getStats: (player, mode, numberFormatter) => {
		const stats = []

		const now = new Date()
		let year = parseInt(now.getFullYear().toString().substr(-2))
		let month = now.getMonth()

		if (month < 1) {
			year--
			month = 12
		}

		const wins = player.stats["SkyWars"]["wins_ranked"] || 0
		const losses = player.stats["SkyWars"]["losses_ranked"] || 1
		const wlr = Math.round((wins / losses) * 100) / 100 || wins

		const kills = player.stats["SkyWars"]["kills_ranked"] || 0
		const deaths = player.stats["SkyWars"]["deaths_ranked"] || 1
		const kdr = Math.round((kills / deaths) * 100) / 100 || kills

		const position = player.stats["SkyWars"][`SkyWars_skywars_rating_${month}_${year}_position`] || 0
		const rating = player.stats["SkyWars"][`SkyWars_skywars_rating_${month}_${year}_rating`] || 0

		const division = util.getDivision(position)

		let threatLevel = 0
		let wlrThreat = 0
		let kdrThreat = 0

		if (kdr >= 5) {
			kdrThreat = 3
			threatLevel += 3
		} else if (kdr >= 3.5) {
			kdrThreat = 2
			threatLevel += 2
		} else if (kdr >= 1.5) {
			kdrThreat = 1
			threatLevel++
		}

		if (wlr >= 1) {
			wlrThreat = 3
			threatLevel += 3
		} else if (wlr >= 0.75) {
			wlrThreat = 2
			threatLevel += 2
		} else if (wlr >= 0.3) {
			wlrThreat = 1
			threatLevel++
		}

		const overallThreatLevel = Math.round(threatLevel/2)

		const star = util.stripFormatting(player.stats["SkyWars"].levelFormatted).split(/\d+/)[1]
		const level = util.stripFormatting(player.stats["SkyWars"].levelFormatted).split(/\D+/)[0]
		const prestige = util.getPrestige(parseInt(level), 5, prestiges)

		stats.push(`<span style="color: ${colors[threatColors[overallThreatLevel]]};">${threatNames[overallThreatLevel]}</span>`)
		stats.push(util.formatPrestige(level, prestige, star))
		stats.push(`<span style="color: ${colors[threatColors[wlrThreat]]};">${numberFormatter.format(wlr)}</span>`)
		stats.push(`<span style="color: ${colors[threatColors[kdrThreat]]};">${numberFormatter.format(kdr)}</span>`)
		if (rating == 0 || position == 0) {
			stats.push(`<span style="color: ${colors["DARK_GRAY"]};">N/A</span>`)
			stats.push(`<span style="color: ${colors["DARK_GRAY"]};">N/A</span>`)
			stats.push(`<span style="color: ${colors["DARK_GRAY"]};">N/A</span>`)
		} else {
			stats.push(`<span style="color: ${colors["AQUA"]};">${numberFormatter.format(rating)}</span>`)
			stats.push(`<span style="color: ${colors["AQUA"]};">#${numberFormatter.format(position)}</span>`)
			stats.push(`<span style="color: ${colors[division.color]};">${division.name}</span>`)
		}

		return stats
	}
}