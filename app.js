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

const { app, BrowserWindow, ipcMain } = require("electron")
const { autoUpdater } = require("electron-updater")
const path = require("path")
const { argv } = require("process")
const os = require("os")

let updateWindow = null

const openOverlay = () => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		frame: argv[2] == "--test-mode",
		transparent: argv[2] != "--test-mode",
		title: "Duels Overlay",
		show: false,
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

	win.on("ready-to-show", () => {
		win.show()
		if (updateWindow) {
			updateWindow.close()
			updateWindow = undefined
		}
	})

	win.on("close", () => {
		if (os.platform() == "darwin")
			app.quit()
	})

	win.loadFile("./src/index.htm")
}

app.on("ready", () => {
	updateWindow = new BrowserWindow({
		width: 350,
		height: 400,
		frame: false,
		resizable: false,
		show: false,
		icon: path.join(__dirname, "/assets/icons/512x.png"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	})

	updateWindow.on("ready-to-show", () => {
		updateWindow.show()

		autoUpdater.checkForUpdates().catch(() => {
			openOverlay()
			updateWindow.webContents.send("status", "Starting...")
		})
	})

	updateWindow.on("close", () => {
		if (os.platform() == "darwin")
			app.quit()
	})

	autoUpdater.on("update-available", () => {
		updateWindow.webContents.send("status", "Updating")
		updateWindow.webContents.send("show-progress", true)
	})

	autoUpdater.on("checking-for-update", () => {
		updateWindow.webContents.send("status", "Checking for update")
	})

	autoUpdater.on("download-progress", (progress) => {
		updateWindow.webContents.send("status", `Updating ${Math.round((progress.bytesPerSecond/Math.pow(1024,2))*100)/100}MB/s`)
		updateWindow.webContents.send("progress", progress.percent)
		console.log(progress)
	})

	autoUpdater.on("update-downloaded", () => {
		updateWindow.webContents.send("status", "Restarting to update")
		updateWindow.webContents.send("show-progress", false)
		autoUpdater.quitAndInstall(true, true)
	})

	autoUpdater.on("update-not-available", () => {
		openOverlay()
		updateWindow.webContents.send("status", "Starting...")
	})

	updateWindow.loadFile("./src/update.htm")
})