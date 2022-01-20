import PlayerMessage from '../network/player/PlayerMessage'

type RitesCard = {
	class: string
	count: number
}

type RitesItem = {
	cardClass: string
}

export type RitesEncounter = {
	class: string
}

export type RitesPlayerCharacter = {
	body: 'humanoid' | 'avian' | 'equine'
	heritage: 'mundane' | 'arcane' | 'nature'
	appearance: 'masculine' | 'feminine' | 'ambigous'
	personality: {
		brave: number
		charming: number
		honorable: number
		nihilistic: number
	}
}

export type RitesProgressionRunStatePlayer = {
	cards: RitesCard[]
	items: RitesItem[]
}

export type RitesProgressionRunState = {
	playersExpected: number
	players: PlayerMessage[]
	playerStates: Record<string, RitesProgressionRunStatePlayer>
	encounterDeck: RitesEncounter[]
	encounterHistory: RitesEncounter[]
}

export type RitesProgressionMetaState = {
	runCount: number
	character: RitesPlayerCharacter
}

export type RitesProgressionState = {
	version: number
	run: RitesProgressionRunState
	lastRun: RitesProgressionRunState | null
	meta: RitesProgressionMetaState
}
