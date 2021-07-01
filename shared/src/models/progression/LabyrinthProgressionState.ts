import PlayerMessage from '../network/player/PlayerMessage'

type LabyrinthCard = {
	class: string
	count: number
}

type LabyrinthItem = {
	cardClass: string
}

type LabyrinthEncounter = {
	class: string
}

export type LabyrinthProgressionRunStatePlayer = {
	cards: LabyrinthCard[]
	items: LabyrinthItem[]
}

export type LabyrinthProgressionRunState = {
	playersExpected: number
	players: PlayerMessage[]
	playerStates: Record<string, LabyrinthProgressionRunStatePlayer>
	encounterHistory: LabyrinthEncounter[]
}

export type LabyrinthProgressionMetaState = {
	runCount: number
}

export type LabyrinthProgressionState = {
	version: number
	run: LabyrinthProgressionRunState
	lastRun: LabyrinthProgressionRunState | null
	meta: LabyrinthProgressionMetaState
}
