import PlayerInGameMessage from '../playerInGame/PlayerInGameMessage'

export default interface PlayerGroupMessage {
	id: string
	username: string
	players: PlayerInGameMessage[]
	roundWins: number
	openHumanSlots: number
	openBotSlots: number
}
