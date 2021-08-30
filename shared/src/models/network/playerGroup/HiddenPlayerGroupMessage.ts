import { SourcePlayerGroup } from '../../PlayerGroup'
import HiddenPlayerInGameMessage from '../playerInGame/HiddenPlayerInGameMessage'
import PlayerGroupMessage from './PlayerGroupMessage'

export default class HiddenPlayerGroupMessage implements PlayerGroupMessage {
	id: string
	username: string
	players: HiddenPlayerInGameMessage[]
	roundWins: number
	openHumanSlots: number
	openBotSlots: number

	constructor(playerGroup: SourcePlayerGroup) {
		this.id = playerGroup.id
		this.username = playerGroup.username
		this.players = playerGroup.players.map((player) => new HiddenPlayerInGameMessage(player))
		this.roundWins = playerGroup.roundWins
		this.openHumanSlots = playerGroup.openHumanSlots
		this.openBotSlots = playerGroup.openBotSlots
	}
}
