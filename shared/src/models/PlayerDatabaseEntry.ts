import Language from '@shared/models/Language'

export default interface PlayerDatabaseEntry {
	id: string
	email: string
	username: string
	passwordHash: string
	userLanguage: Language
}
