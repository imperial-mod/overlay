const { ipcRenderer } = require("electron")

window.addEventListener("load", () => {
	const progress = document.querySelector("#progress")
	const progressOuter = document.querySelector("#progress-outer")
	const status = document.querySelector("#status")

	ipcRenderer.on("status", (ev, state) => {
		status.innerText = state
	})

	ipcRenderer.on("progress", (ev, percent) => {
		progress.style.width = `${percent}%`
	})

	ipcRenderer.on("show-progress", (ev, show) => {
		console.log(show)
		if (show)
			progressOuter.style.visibility = "visible"
		else
			progressOuter.style.visibility = "hidden"
	})
})