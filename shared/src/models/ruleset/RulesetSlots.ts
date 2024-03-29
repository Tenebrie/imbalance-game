export type RulesetSlotPlayer = RulesetSlotHumanPlayer | RulesetSlotAIPlayer

type RulesetSlotHumanPlayer = {
	type: 'player'
}

type RulesetSlotAIPlayer = {
	type: 'ai' | 'overmind'
}

export interface RulesetSlotGroup {
	players: RulesetSlotPlayer[]
}

export default interface RulesetSlots {
	groups: RulesetSlotGroup[]
}
