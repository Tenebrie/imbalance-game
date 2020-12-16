import AccessLevel from '../../../enums/AccessLevel'

export default interface PlayerMessage {
	id: string
	email: string
	username: string
	accessLevel: AccessLevel
}
