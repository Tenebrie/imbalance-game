import GameEvent from '../../enums/GameEvent'

interface EventLogEntryMessage {
	event: GameEvent
	timestamp: number
	args: any
}

export default EventLogEntryMessage
