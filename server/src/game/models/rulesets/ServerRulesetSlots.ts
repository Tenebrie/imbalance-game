import RulesetSlots, { RulesetSlotGroup, RulesetSlotPlayer } from '@shared/models/ruleset/RulesetSlots'

type RulesetSlotsBuilderPlayerGroup = RulesetSlotPlayer[]

export class ServerRulesetSlots implements RulesetSlots {
	public groups: RulesetSlotGroup[] = []

	constructor(groups: RulesetSlotGroup[]) {
		this.groups = groups
	}
}

export class RulesetSlotsBuilder {
	private groups: RulesetSlotsBuilderPlayerGroup[] = []

	public addGroup(group: RulesetSlotsBuilderPlayerGroup): RulesetSlotsBuilder {
		this.groups.push(group)
		return this
	}

	public __build(): ServerRulesetSlots {
		const groups: RulesetSlotGroup[] = this.groups.map((group) => ({
			players: group,
		}))
		return new ServerRulesetSlots(groups)
	}
}
