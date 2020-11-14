import Language from '../../enums/Language'
import AccessLevel from '../../enums/AccessLevel'
import RenderQuality from '../../enums/RenderQuality'
import PlayerDatabaseEntry from '../PlayerDatabaseEntry'

export default class UserProfileMessage {
	email: string
	username: string
	userLanguage: Language
	renderQuality: RenderQuality
	masterVolume: number
	musicVolume: number
	effectsVolume: number
	ambienceVolume: number
	userInterfaceVolume: number

	constructor(databaseEntry: PlayerDatabaseEntry) {
		const splitEmail = databaseEntry.email.split('@')
		this.email = splitEmail[0].charAt(0) + '***' + splitEmail[0].charAt(splitEmail[0].length - 1)
		if (splitEmail[1]) {
			this.email = this.email + '@' + splitEmail[1]
		}
		this.username = databaseEntry.username
		this.userLanguage = databaseEntry.userLanguage
		this.renderQuality = databaseEntry.renderQuality
		this.masterVolume = databaseEntry.masterVolume
		this.musicVolume = databaseEntry.musicVolume
		this.effectsVolume = databaseEntry.effectsVolume
		this.ambienceVolume = databaseEntry.ambienceVolume
		this.userInterfaceVolume = databaseEntry.userInterfaceVolume
	}
}
