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

const { app, BrowserWindow } = require("electron")
const path = require("path")
const { argv } = require("process")

app.on("ready", () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        //frame: argv[2] == "--test-mode",
        transparent: argv[2] != "--test-mode",
        title: "Duels Overlay",
        icon: path.join(__dirname, "/assets/icons/512x.png"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    if (argv[2] != "--test-mode") {
        win.setAlwaysOnTop(true)

        win.on("blur", () => {
            win.setIgnoreMouseEvents(true)
        })
        
        win.on("focus", () => {
            win.setIgnoreMouseEvents(false)
        })
    }

    win.loadFile("./src/index.htm")
})