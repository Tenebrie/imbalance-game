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
}

export type RitesProgressionState = {
	version: number
	run: RitesProgressionRunState
	lastRun: RitesProgressionRunState | null
	meta: RitesProgressionMetaState
}
