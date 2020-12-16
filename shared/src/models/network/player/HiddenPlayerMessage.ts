import Player from '../../Player'
import AccessLevel from '../../../enums/AccessLevel'
import PlayerMessage from './PlayerMessage'

export default class HiddenPlayerMessage implements PlayerMessage {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel

	constructor(player: Player) {
		this.id = player.id
		this.email = '[hidden]'
		this.username = player.username
		this.accessLevel = AccessLevel.NORMAL
	}
}
