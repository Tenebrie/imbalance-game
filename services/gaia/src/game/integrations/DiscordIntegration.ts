import AsciiColor from '@src/enums/AsciiColor'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayer from '@src/game/players/ServerPlayer'
import { colorize } from '@src/utils/Utils'
import axios from 'axios'
import fs from 'fs'

type GaiaSecrets = {
	DISCORD_PING_ROLE_ID?: string
	DISCORD_ALERT_HOOK?: string
	DISCORD_FEEDBACK_HOOK?: string
}

class DiscordIntegration {
	pingRoleId: string | null
	hookLinks: {
		alerts: string | null
		feedback: string | null
	}

	constructor() {
		const secretsFileExists = fs.existsSync('/run/secrets/gaia')
		const secrets = secretsFileExists ? (JSON.parse(fs.readFileSync('/run/secrets/gaia', 'utf8')) as GaiaSecrets) : {}

		this.pingRoleId = process.env.DISCORD_PING_ROLE_ID || secrets.DISCORD_PING_ROLE_ID || null
		this.hookLinks = {
			alerts: DiscordIntegration.assembleDiscordLink(process.env.DISCORD_ALERT_HOOK || secrets.DISCORD_ALERT_HOOK),
			feedback: DiscordIntegration.assembleDiscordLink(process.env.DISCORD_FEEDBACK_HOOK || secrets.DISCORD_FEEDBACK_HOOK),
		}
	}

	public printStatus(): void {
		const allGood = this.hookLinks.alerts && this.hookLinks.feedback
		if (allGood) {
			console.info(colorize('Successfully loaded Discord integration data.', AsciiColor.GREEN))
			return
		}

		if (!this.hookLinks.alerts) {
			console.warn(colorize('Unable to load Discord Alerts hook. Alerts integration will not work.', AsciiColor.RED))
		}
		if (!this.hookLinks.feedback) {
			console.warn(colorize('Unable to load Discord Feedback hook. Feedback integration will not work.', AsciiColor.RED))
		}
	}

	public sendFeedback(player: ServerPlayer, feedback: string, contactInfo: string): Promise<boolean> {
		let message = [`Feedback received from player **${player.username}** | **${player.email}**`, '**Text:**', feedback, '----------']
		if (contactInfo.length > 0) {
			message = message.concat(['**Contact info:**', contactInfo, '----------'])
		}
		return this.sendMessage('feedback', message.join('\n'))
	}

	public sendError(game: ServerGame, error: Error): Promise<boolean> {
		const message = [
			'Normal game error has occurred.',
			`- **Ruleset:** ${game.ruleset.class}`,
			`- **Players:** ${game.players.map((group) => `[${group.username}]`).join(', ')}`,
			'```fix',
			error.stack,
			'```',
		]
		return this.sendMessage('alerts', message.join('\n'))
	}

	public sendFatalError(game: ServerGame, error: Error): Promise<boolean> {
		const message = [
			'Fatal game error has occurred.',
			`- **Ruleset:** ${game.ruleset.class}`,
			`- **Players:** ${game.players.map((group) => `[${group.username}]`).join(', ')}`,
			'```fix',
			error.stack,
			'```',
		]
		return this.sendMessage('alerts', message.join('\n'))
	}

	public async sendMessage(channel: 'alerts' | 'feedback', message: string): Promise<boolean> {
		const formattedMessage = this.pingRoleId ? `<@&${this.pingRoleId}> ${message}` : message
		try {
			if (channel === 'alerts' && this.hookLinks.alerts) {
				await this.sendMessageChunks(this.hookLinks.alerts, formattedMessage)
			} else if (channel === 'feedback' && this.hookLinks.feedback) {
				await this.sendMessageChunks(this.hookLinks.feedback, formattedMessage)
			}
			return true
		} catch (error) {
			console.error('Unable to send message to Discord', error)
			return false
		}
	}

	public async sendMessageChunks(url: string, message: string): Promise<boolean> {
		const bigLines = message.split('\n')
		const lines: string[] = bigLines.flatMap((line) => line.match(/.{1,1999}/g) || [])

		const chunks: string[] = []
		let currentChunk = ''
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (currentChunk.length + line.length < 2000) {
				currentChunk += '\n' + line
			} else {
				chunks.push(currentChunk)
				currentChunk = line
			}
		}
		chunks.push(currentChunk)
		if (chunks.length > 5) {
			console.error(`Message too long: ${message.length} characters.`)
			return false
		}

		for (let i = 0; i < chunks.length; i++) {
			await axios.post(url, {
				content: chunks[i],
			})
		}
		return true
	}

	private static assembleDiscordLink(path: string | undefined): string | null {
		if (!path) {
			return null
		}
		return `https://discord.com/api/webhooks/${path}`
	}
}

export default new DiscordIntegration()
