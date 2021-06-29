export type RulesetSlotPlayer = {
	type: 'player' | 'ai'
}

export interface RulesetSlotGroup {
	players: RulesetSlotPlayer[]
}

export default interface RulesetSlots {
	groups: RulesetSlotGroup[]
}
