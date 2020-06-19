import Player from '../Player'

export default class UserProfileMessage {
	email: string
	username: string

	constructor(email: string, username: string) {
		const splitEmail = email.split('@')
		this.email = splitEmail[0].charAt(0) + '***' + splitEmail[0].charAt(splitEmail[0].length - 1)
		if (splitEmail[1]) {
			this.email = this.email + '@' + splitEmail[1]
		}
		this.username = username
	}

	static fromPlayerAndEmail(email: string, username: string): UserProfileMessage {
		return new UserProfileMessage(email, username)
	}
}
