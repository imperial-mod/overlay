//Adapted from https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/examples/proxy/proxy.js

const EventEmitter = require("events")
const mc = require("minecraft-protocol")

const states = mc.states

const { McAPI } = require("./api")

const mcApi = new McAPI()

class Proxy extends EventEmitter {
	constructor(username, auth, port) {
		super()

		this.username = username
		this.auth = auth || "mojang"
		this.port = port || 25566
	}

	startProxy = () => {
		const packetsToParse = ["chat", "position", "named_entity_spawn", "login", "entity_destroy"]
		const srv = mc.createServer({
			"online-mode": false,
			port: this.port,
			keepAlive: false,
			version: "1.8"
		})
		srv.on("login", (client) => {
			const onlinePlayers = []

			mcApi.getUuid(this.username).then(
				(uuid) => {
					client.uuid = uuid
				}
			)

			const addPlayer = (id, uuid, name) => {
				onlinePlayers.push({ id, uuid, name })
			}

			const getPlayer = (id) => {
				for (const i in onlinePlayers) {
					const player = onlinePlayers[i]

					if (player.id == id) {
						return player
					}
				}
			}

			const removePlayer = (id) => {
				for (const i in onlinePlayers) {
					const player = onlinePlayers[i]

					if (player.id == id) {
						onlinePlayers.splice(i, 1)
						return
					}
				}
			}

			const addr = client.socket.remoteAddress
			console.log(`Incoming connection (${addr})`)
			let endedClient = false
			let endedTargetClient = false

			client.on("end", () => {
				endedClient = true
				console.log(`Connection closed by client (${addr})`)
				if (!endedTargetClient) { targetClient.end("End") }
			})
			client.on("error", (err) => {
				endedClient = true
				console.log(`Connection error by client (${addr})`)
				console.log(err.stack)
				if (!endedTargetClient) { targetClient.end("Error") }
			})
			const targetClient = mc.createClient({
				host: "mc.hypixel.net",
				port: 25565,
				username: client.username,
				keepAlive: false,
				version: "1.8",
				profilesFolder: require("minecraft-folder-path"),
				auth: this.auth
			})
			client.on("raw", async (raw, meta) => {
				if (meta.state == states.PLAY && targetClient.state == states.PLAY) {
					if (!endedTargetClient) {
						if (packetsToParse.includes(meta.name)) {
							const data = client.deserializer.parsePacketBuffer(raw).data.params
							if (meta.name == "chat") {
								if (data.message.trim() == "/who") {
									let friendlyPlayers = ""
									for (const player of onlinePlayers) {
										friendlyPlayers += `, ${player.name}`
									}
									client.write("chat", { message: JSON.stringify({ text: `§7Online: §b${friendlyPlayers.replace(", ", "")}` }), position: 0 })
									return
								}
							}
						}
						targetClient.writeRaw(raw)
					}
				}
			})
			targetClient.on("raw", async (raw, meta) => {
				if (meta.state == states.PLAY && client.state == states.PLAY) {
					if (!endedClient) {
						if (packetsToParse.includes(meta.name)) {
							const data = targetClient.deserializer.parsePacketBuffer(raw).data.params
							if (meta.name == "named_entity_spawn") {
								if (!getPlayer(data.entityId)) {
									const profile = await mcApi.getProfile(data.playerUUID)

									if (profile.success) {
										addPlayer(data.entityId, data.playerUUID, profile.name)
										this.emit("join", profile.id, profile.name)
									}
								}
							}
							if (meta.name == "entity_destroy") {
								if (getPlayer(data.entityId)) {
									removePlayer(data.entityId)
									this.emit("leave", getPlayer(data.entityId).name)
								}
							}
							if (meta.name == "login") {
								for (const i in onlinePlayers) {
									this.emit("leave", onlinePlayers[i].name)
									removePlayer(onlinePlayers[i].id)
								}
								addPlayer(data.entityId, targetClient.uuid, targetClient.username)
								this.emit("join", targetClient.uuid, targetClient.username)
							}
							if (meta.name == "position") {
								for (const i in onlinePlayers) {
									this.emit("leave", onlinePlayers[i].name)
									if (onlinePlayers[i].uuid != targetClient.uuid)
										removePlayer(onlinePlayers[i].id)
								}
								this.emit("join", targetClient.uuid, targetClient.username)
							}
						}
						client.writeRaw(raw)
					}
				}
			})
			targetClient.on("end", () => {
				endedTargetClient = true
				console.log(`Connection closed by server (${addr}) `)
				if (!endedClient) { client.end("End") }
			})
			targetClient.on("error", (err) => {
				endedTargetClient = true
				console.log(`Connection error by server (${addr}) `, err)
				console.log(err.stack)
				if (!endedClient) { client.end("Error") }
			})
		})
	}
}

module.exports = Proxy