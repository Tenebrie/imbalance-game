import PlayerDatabaseEntry from '../PlayerDatabaseEntry'
import Language from '@shared/models/Language'

export default class UserProfileMessage {
	email: string
	username: string
	userLanguage: Language

	constructor(databaseEntry: PlayerDatabaseEntry) {
		const splitEmail = databaseEntry.email.split('@')
		this.email = splitEmail[0].charAt(0) + '***' + splitEmail[0].charAt(splitEmail[0].length - 1)
		if (splitEmail[1]) {
			this.email = this.email + '@' + splitEmail[1]
		}
		this.username = databaseEntry.username
		this.userLanguage = databaseEntry.userLanguage
	}
}
