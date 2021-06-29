import { RulesetSlotGroup, RulesetSlotPlayer } from '@shared/models/ruleset/RulesetSlots'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'

export default class ServerPlayerGroupSlots implements RulesetSlotGroup {
	group: ServerPlayerGroup
	players: RulesetSlotPlayer[]

	constructor(group: ServerPlayerGroup, slots: RulesetSlotGroup) {
		this.group = group
		this.players = slots.players
	}

	public get totalHumanSlots(): number {
		return this.players.filter((playerSlot) => playerSlot.type === 'player').length
	}

	public get totalBotSlots(): number {
		return this.players.filter((playerSlot) => playerSlot.type === 'ai').length
	}

	public get openHumanSlots(): number {
		const playersConnected = this.group.players.filter((player) => player.isHuman).length
		const slotsAvailable = this.players.filter((playerSlot) => playerSlot.type === 'player').length
		return slotsAvailable - playersConnected
	}

	public get openBotSlots(): number {
		const playersConnected = this.group.players.filter((player) => player.isBot).length
		const slotsAvailable = this.players.filter((playerSlot) => playerSlot.type === 'ai').length
		return slotsAvailable - playersConnected
	}
}
