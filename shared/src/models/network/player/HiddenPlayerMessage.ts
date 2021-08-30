import AccessLevel from '../../../enums/AccessLevel'
import Player from '../../Player'
import PlayerMessage from './PlayerMessage'

export default class HiddenPlayerMessage implements PlayerMessage {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel
	isGuest: boolean

	constructor(player: Player) {
		this.id = player.id
		this.email = '[hidden]'
		this.username = player.username
		this.accessLevel = AccessLevel.NORMAL
		this.isGuest = false
	}
}
