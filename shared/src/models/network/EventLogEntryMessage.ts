import GameEventType from '../../enums/GameEventType'

interface EventLogEntryMessage {
	event: GameEventType
	timestamp: number
	subtype: string | undefined
	args: any
}

export default EventLogEntryMessage
