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

export type LabyrinthProgressionRunState = {
	cards: LabyrinthCard[]
	items: LabyrinthItem[]
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
