import RulesetSlots from '@shared/models/ruleset/RulesetSlots'
import AIBehaviour from '@shared/enums/AIBehaviour'
import { RulesetDeckTemplate } from '@src/game/models/rulesets/ServerRuleset'
import CustomDeckRules from '@shared/enums/CustomDeckRules'

export type ServerRulesetSlotHumanPlayer = {
	type: 'player'
	deck: RulesetDeckTemplate | CustomDeckRules
}

export type ServerRulesetSlotAIPlayer = {
	type: 'ai'
	deck: RulesetDeckTemplate
	behaviour: AIBehaviour
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
