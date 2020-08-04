import Language from './Language'
import RenderQuality from '../enums/RenderQuality'

export default interface PlayerDatabaseEntry {
	id: string
	email: string
	username: string
	passwordHash: string
	userLanguage: Language
	renderQuality: RenderQuality
	masterVolume: number
	musicVolume: number
	effectsVolume: number
	ambienceVolume: number
	userInterfaceVolume: number
}
