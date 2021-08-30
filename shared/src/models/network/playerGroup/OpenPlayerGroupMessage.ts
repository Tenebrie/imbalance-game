import { SourcePlayerGroup } from '../../PlayerGroup'
import OpenPlayerInGameMessage from '../playerInGame/OpenPlayerInGameMessage'
import PlayerGroupMessage from './PlayerGroupMessage'

export default class OpenPlayerGroupMessage implements PlayerGroupMessage {
	id: string
	username: string
	players: OpenPlayerInGameMessage[]
	roundWins: number
	openHumanSlots: number
	openBotSlots: number

	constructor(playerGroup: SourcePlayerGroup) {
		this.id = playerGroup.id
		this.username = playerGroup.username
		this.players = playerGroup.players.map((player) => new OpenPlayerInGameMessage(player))
		this.roundWins = playerGroup.roundWins
		this.openHumanSlots = playerGroup.openHumanSlots
		this.openBotSlots = playerGroup.openBotSlots
	}
}
