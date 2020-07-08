import PlayerDatabaseEntry from '../PlayerDatabaseEntry'
import Language from '../Language'
import RenderQuality from '../../enums/RenderQuality'

export default class UserProfileMessage {
	email: string
	username: string
	userLanguage: Language
	renderQuality: RenderQuality

	constructor(databaseEntry: PlayerDatabaseEntry) {
		const splitEmail = databaseEntry.email.split('@')
		this.email = splitEmail[0].charAt(0) + '***' + splitEmail[0].charAt(splitEmail[0].length - 1)
		if (splitEmail[1]) {
			this.email = this.email + '@' + splitEmail[1]
		}
		this.username = databaseEntry.username
		this.userLanguage = databaseEntry.userLanguage
		this.renderQuality = databaseEntry.renderQuality
	}
}
