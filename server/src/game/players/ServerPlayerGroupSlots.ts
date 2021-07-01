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
		const game = this.group.game
		const slots = this.players
			.filter((playerSlot) => !playerSlot.require || playerSlot.require(game))
			.filter((playerSlot) => playerSlot.type === 'player')
		const slotsTaken = this.group.players.filter((player) => player.isHuman).length
		const slot = slots[slotsTaken]
		if (!slot) {
			throw new Error('No open human slot available!')
		}
		return slot as ServerRulesetSlotHumanPlayer
	}

	public grabOpenBotSlot(): ServerRulesetSlotAIPlayer {
		const game = this.group.game
		const slots = this.players
			.filter((playerSlot) => !playerSlot.require || playerSlot.require(game))
			.filter((playerSlot) => playerSlot.type === 'ai')
		const slotsTaken = this.group.players.filter((player) => player.isBot).length
		const slot = slots[slotsTaken]
		if (!slot) {
			throw new Error('No open bot slot available!')
		}
		return slot as ServerRulesetSlotAIPlayer
	}

	public get totalHumanSlots(): number {
		const game = this.group.game
		return this.players
			.filter((playerSlot) => !playerSlot.require || playerSlot.require(game))
			.filter((playerSlot) => playerSlot.type === 'player').length
	}

	public get totalBotSlots(): number {
		const game = this.group.game
		return this.players
			.filter((playerSlot) => !playerSlot.require || playerSlot.require(game))
			.filter((playerSlot) => playerSlot.type === 'ai').length
	}

	public get openHumanSlots(): number {
		const game = this.group.game
		const playersConnected = this.group.players.filter((player) => player.isHuman).length
		const slotsAvailable = this.players
			.filter((playerSlot) => !playerSlot.require || playerSlot.require(game))
			.filter((playerSlot) => playerSlot.type === 'player').length
		return slotsAvailable - playersConnected
	}

	public get openBotSlots(): number {
		const game = this.group.game
		const playersConnected = this.group.players.filter((player) => player.isBot).length
		const slotsAvailable = this.players
			.filter((playerSlot) => !playerSlot.require || playerSlot.require(game))
			.filter((playerSlot) => playerSlot.type === 'ai').length
		return slotsAvailable - playersConnected
	}
}
