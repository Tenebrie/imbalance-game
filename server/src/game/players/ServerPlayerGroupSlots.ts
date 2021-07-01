import { RulesetSlotGroup } from '@shared/models/ruleset/RulesetSlots'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import {
	ServerRulesetSlotAIPlayer,
	ServerRulesetSlotGroup,
	ServerRulesetSlotHumanPlayer,
	ServerRulesetSlotPlayer,
} from '@src/game/models/rulesets/ServerRulesetSlots'

export default class ServerPlayerGroupSlots implements RulesetSlotGroup {
	group: ServerPlayerGroup
	players: ServerRulesetSlotPlayer[]

	constructor(group: ServerPlayerGroup, slots: ServerRulesetSlotGroup) {
		this.group = group
		this.players = slots.players
	}

	public grabOpenHumanSlot(): ServerRulesetSlotHumanPlayer {
		const slots = this.players.filter((slot) => slot.type === 'player')
		const slotsTaken = this.group.players.filter((player) => player.isHuman).length
		const slot = slots[slotsTaken]
		if (!slot) {
			throw new Error('No open human slot available!')
		}
		return slot as ServerRulesetSlotHumanPlayer
	}

	public grabOpenBotSlot(): ServerRulesetSlotAIPlayer {
		const slots = this.players.filter((slot) => slot.type === 'ai')
		const slotsTaken = this.group.players.filter((player) => player.isBot).length
		const slot = slots[slotsTaken]
		if (!slot) {
			throw new Error('No open bot slot available!')
		}
		return slot as ServerRulesetSlotAIPlayer
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
