import Language from '../enums/Language'
import AccessLevel from '../enums/AccessLevel'
import RenderQuality from '../enums/RenderQuality'

export default interface PlayerDatabaseEntry {
	id: string
	email: string
	username: string
	passwordHash: string
	createdAt: string
	accessedAt: string
	accessLevel: AccessLevel
	userLanguage: Language
	renderQuality: RenderQuality
	masterVolume: number
	musicVolume: number
	effectsVolume: number
	ambienceVolume: number
	userInterfaceVolume: number
	welcomeModalSeenAt: string
	mobileModalSeenAt: string
}
