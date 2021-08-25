import PlayerInGame from './PlayerInGame'

export default interface PlayerGroup {
	id: string
	username: string
	players: PlayerInGame[]
	roundWins: number
}

export interface SourcePlayerGroup extends PlayerGroup {
	openHumanSlots: number
	openBotSlots: number
}
