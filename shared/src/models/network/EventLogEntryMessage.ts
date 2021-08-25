import GameEventType from '../../enums/GameEventType'

interface EventLogEntryMessage {
	event: GameEventType
	timestamp: number
	subtype: string | undefined
	args: Record<string, string | string[] | number | number[]>
}

export default EventLogEntryMessage
