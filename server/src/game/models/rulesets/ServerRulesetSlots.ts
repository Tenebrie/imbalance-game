import AIBehaviour from '@shared/enums/AIBehaviour'
import CustomDeckRules from '@shared/enums/CustomDeckRules'
import RulesetSlots from '@shared/models/ruleset/RulesetSlots'
import { RulesetDeckTemplate } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

type ServerRulesetSlotRequire = (game: ServerGame) => boolean

export type ServerRulesetSlotHumanPlayer = {
	type: 'player'
	deck: RulesetDeckTemplate | CustomDeckRules
	require?: ServerRulesetSlotRequire
}

export type ServerRulesetSlotAIPlayer = {
	type: 'ai'
	deck: RulesetDeckTemplate
	behaviour: AIBehaviour
	require?: ServerRulesetSlotRequire
}

export type ServerRulesetSlotPlayer = ServerRulesetSlotHumanPlayer | ServerRulesetSlotAIPlayer

export type ServerRulesetSlotGroup = {
	players: ServerRulesetSlotPlayer[]
}

export class ServerRulesetSlots implements RulesetSlots {
	public groups: ServerRulesetSlotGroup[] = []

	constructor(groups: ServerRulesetSlotGroup[]) {
		this.groups = groups
	}

	public openHumanSlots(game: ServerGame): number {
		return game.players.reduce((total, playerGroup) => total + playerGroup.openHumanSlots, 0)
	}

	public totalHumanSlots(game: ServerGame): number {
		return this.groups
			.flatMap((group) => group.players)
			.filter((player) => player.type === 'player')
			.filter((player) => !player.require || player.require(game)).length
	}

	public openBotSlots(game: ServerGame): number {
		return game.players.reduce((total, playerGroup) => total + playerGroup.openBotSlots, 0)
	}
}

type RulesetSlotsBuilderGroup = ServerRulesetSlotPlayer[]

export class RulesetSlotsBuilder {
	private groups: RulesetSlotsBuilderGroup[] = []

	public addGroup(group: ServerRulesetSlotPlayer | RulesetSlotsBuilderGroup): RulesetSlotsBuilder {
		if (this.groups.length === 2) {
			throw new Error('There can only be two groups of players.')
		}
		if (!Array.isArray(group)) {
			group = [group]
		}
		this.groups.push(group)
		return this
	}

	public __build(): ServerRulesetSlots {
		const groups = this.groups.map((group) => ({
			players: group,
		}))
		return new ServerRulesetSlots(groups)
	}
}
