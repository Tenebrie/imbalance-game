import Player from '../../Player'
import AccessLevel from '../../../enums/AccessLevel'
import PlayerMessage from './PlayerMessage'

export default class PlayerRefMessage {
	public readonly id: string

	constructor(player: Player) {
		this.id = player.id
	}
}
