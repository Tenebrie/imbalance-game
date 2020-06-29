import Language from './Language'

export default interface PlayerDatabaseEntry {
	id: string
	email: string
	username: string
	passwordHash: string
	userLanguage: Language
}
