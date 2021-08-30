import AccessLevel from '../../../enums/AccessLevel'
import Player from '../../Player'
import PlayerMessage from './PlayerMessage'

export default class OpenPlayerMessage implements PlayerMessage {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel
	isGuest: boolean

	constructor(player: Player) {
		this.id = player.id
		this.email = player.email
		this.username = player.username
		this.accessLevel = player.accessLevel
		this.isGuest = player.isGuest
	}
}
