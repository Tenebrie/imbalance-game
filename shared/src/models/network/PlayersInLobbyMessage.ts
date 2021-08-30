import Player from '../Player'
import HiddenPlayerMessage from './player/HiddenPlayerMessage'

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
