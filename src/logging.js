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

module.exports = (time = Date.now()) => {
	const folder = path.join(os.homedir(), "/duels_overlay")
	const logsPath = path.join(folder, "/logs")
	const log = path.join(logsPath, `${time}.log`)

	if (!fs.existsSync(logsPath)) {
		fs.mkdirSync(logsPath, { recursive: true })
	}

	global.console.log = (...args) => {
		let finalString = ""
		for (const arg of args) {
			if (typeof arg == "object") {
				finalString += `${JSON.stringify(arg)} `
			} else {
				finalString += arg + " "
			}
		}

		finalString = `[${new Date().toISOString()}] [INFO]: ${finalString}\n`

		process.stdout.write(finalString)
		fs.appendFile(log, finalString, () => { })
	}

	global.console.warn = (...args) => {
		let finalString = ""
		for (const arg of args) {
			if (typeof arg == "object") {
				finalString += `${JSON.stringify(arg)} `
			} else {
				finalString += arg + " "
			}
		}

		finalString = `[${new Date().toISOString()}] [WARN]: ${finalString}\n`

		process.stdout.write(finalString)
		fs.appendFile(log, finalString, () => { })
	}

	global.console.error = (...args) => {
		let finalString = ""
		for (const arg of args) {
			if (typeof arg == "object") {
				finalString += `${JSON.stringify(arg)} `
			} else {
				finalString += arg + " "
			}
		}

		finalString = `[${new Date().toISOString()}] [ERR]: ${finalString}\n`

		process.stdout.write(finalString)
		fs.appendFile(log, finalString, () => { })
	}

	global.console.err = console.error

	global.console.info = (...args) => {
		let finalString = ""
		for (const arg of args) {
			if (typeof arg == "object") {
				finalString += `${JSON.stringify(arg)} `
			} else {
				finalString += arg + " "
			}
		}

		finalString = `[${new Date().toISOString()}] [INFO]: ${finalString}\n`

		process.stdout.write(finalString)
		fs.appendFile(log, finalString, () => { })
	}

	try {
		if (window) {
			console.log(`Logging started in renderer. Log file: ${time}.log`)
			return
		}
	} catch {
		console.log(`Logging started in host process. Log file: ${time}.log`)
	}
}