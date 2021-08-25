import HiddenPlayerMessage from './player/HiddenPlayerMessage'
import Player from '../Player'

export default class PlayersInLobbyMessage {
	slotsOpen: number
	slotsTotal: number
	players: HiddenPlayerMessage[]

	constructor(slotsOpen: number, slotsTotal: number, players: Player[]) {
		this.slotsOpen = slotsOpen
		this.slotsTotal = slotsTotal
		this.players = players.map((player) => new HiddenPlayerMessage(player))
	}
}
