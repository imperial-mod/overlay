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

"use strict"

const EventEmitter = require("events")
const fs = require("fs")

class LogReader extends EventEmitter {
    path
    constructor(path) {
        super()

        this.path = path
        this.watch()
    }

    watch = () => {
        let lastLog = []
        let logs = []
        let changedLogs = []
        fs.watchFile(this.path, {persistent: true, interval: 4}, (curr, prev) => {
            const logFile = fs.readFileSync(this.path, {encoding: "utf8"})

            logs = logFile.split("\n")

            if (lastLog.length > 0) {
                for (let i = 0; i < logs.length; i++) {
                    if (logs[i] != lastLog[i]) {
                        changedLogs.push(logs[i])
                    }
                }
            }

            lastLog = logs

            for (const latestLog of changedLogs) {
                if (/\[[^]*\] \[Client thread\/INFO\]: \[CHAT\] [^]*/.test(latestLog)) {
                    const message = latestLog.split("[CHAT] ")[1].trim()

                    if (/Sending you to (.*)!/.test(message)) {
                        console.log(message)

                        this.emit("server_change")
                    }

                    if (/(.*) joined \((\d)\/(\d)\)!/.test(message)) {
                        const name = message.split(" ")[0]
                        this.emit("join", name)
                    }

                    if (/(.*) has quit!/.test(message)) {
                        const name = message.split(" ")[0]
                        this.emit("leave", name)
                    }
                }
            }

            changedLogs = []
        })
    }
}

module.exports = LogReader