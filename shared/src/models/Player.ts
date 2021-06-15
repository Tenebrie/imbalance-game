import AccessLevel from '../enums/AccessLevel'

export default interface Player {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel
	isGuest: boolean
}
