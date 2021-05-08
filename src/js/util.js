const colors = require("../constants.json").colors

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
            else if (char == prestige.star && prestige.starColor)
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
    }
}