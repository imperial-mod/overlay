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

const colors = require("../constants.json").colors
const rankedDivisions = require("../constants.json").rankedDivisions

const clamp = (inp, min, max) => {
    if (inp > max)
        return max
    if (min > inp)
        return min
    return inp
}

module.exports = {
    getPrestige: (level, levelsPerPres, prestiges) => {
        let pres = Math.floor(level/levelsPerPres)

        return prestiges[pres >= prestiges.length ? prestiges.length-1 : pres]
    },
    formatPrestige: (level, prestige, star) => {
        if (!star)
            star = prestige.star

        const formatString = `[${level}${star}]`

        let finalString = ""
        let patternPiece = 0
        let goingBack = false
        let goingBack2 = false

        for (const char of formatString) {
            const color = prestige.pattern[clamp(patternPiece, 0, prestige.pattern.length-1)]
            patternPiece = clamp(patternPiece, 0, prestige.pattern.length - 1)
            console.log(patternPiece)
            if ((char == "[" || char == "]") && prestige.bracket)
                finalString += `<span style="color: ${colors[prestige.bracket.toUpperCase()]}">${char}</span>`
            else if (char == star && prestige.starColor)
                finalString += `<span style="color: ${colors[prestige.starColor.toUpperCase()]}">${char}</span>`
            else {
                finalString += `<span style="color: ${colors[color.toUpperCase()]}">${char}</span>`
                if (goingBack) {
                    if (goingBack2) {
                        patternPiece--
                    }
                    if (patternPiece == 0) {
                        goingBack = false
                        goingBack2 = false
                    }
                    goingBack2 = true
                } else {
                    patternPiece++
                }
                if (patternPiece >= prestige.pattern.length-1)
                    goingBack = true
            }
        }
        return finalString
    },
	getDivision: (position = 50001) => {
		let lastDiv = rankedDivisions[0]
		for (const division of rankedDivisions) {
			if (division.position < position) {
				return lastDiv
			}
			lastDiv = division
		}
		if (position == 0) return rankedDivisions[0]
		return lastDiv
	},
	stripFormatting: (string) => {
		return string.replace(/§./g, "")
	}
}