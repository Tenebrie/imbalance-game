import Language from '../../enums/Language'
import RenderQuality from '../../enums/RenderQuality'
import PlayerDatabaseEntry from '../PlayerDatabaseEntry'

export default class UserProfileMessage {
	email: string
	username: string
	fastMode: boolean
	userLanguage: Language
	renderQuality: RenderQuality
	masterVolume: number
	musicVolume: number
	effectsVolume: number
	ambienceVolume: number
	userInterfaceVolume: number
	welcomeModalSeenAt: string
	mobileModalSeenAt: string

	constructor(databaseEntry: PlayerDatabaseEntry) {
		const splitEmail = databaseEntry.email.split('@')
		this.email = splitEmail[0].charAt(0) + '***' + splitEmail[0].charAt(splitEmail[0].length - 1)
		if (splitEmail[1]) {
			this.email = this.email + '@' + splitEmail[1]
		}
		this.username = databaseEntry.username
		this.fastMode = databaseEntry.fastMode
		this.userLanguage = databaseEntry.userLanguage
		this.renderQuality = databaseEntry.renderQuality
		this.masterVolume = databaseEntry.masterVolume
		this.musicVolume = databaseEntry.musicVolume
		this.effectsVolume = databaseEntry.effectsVolume
		this.ambienceVolume = databaseEntry.ambienceVolume
		this.userInterfaceVolume = databaseEntry.userInterfaceVolume
		this.welcomeModalSeenAt = databaseEntry.welcomeModalSeenAt
		this.mobileModalSeenAt = databaseEntry.mobileModalSeenAt
	}
}
