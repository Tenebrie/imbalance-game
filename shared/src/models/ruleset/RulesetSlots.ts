import AIBehaviour from '../../enums/AIBehaviour'

export type RulesetSlotPlayer = RulesetSlotHumanPlayer | RulesetSlotAIPlayer

type RulesetSlotHumanPlayer = {
	type: 'player'
}

type RulesetSlotAIPlayer = {
	type: 'ai'
}

export interface RulesetSlotGroup {
	players: RulesetSlotPlayer[]
}

export default interface RulesetSlots {
	groups: RulesetSlotGroup[]
}
