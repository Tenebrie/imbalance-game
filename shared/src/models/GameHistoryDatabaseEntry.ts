import EventLogEntryMessage from './network/EventLogEntryMessage'

export default interface GameHistoryDatabaseEntry {
	id: string
	ruleset: string
	startedAt: string
	closedAt: string | null
	closeReason: string
	victoriousPlayer: { id: string; username: string }[]
	players: GameHistoryPlayerDatabaseEntry[]
	eventLog: EventLogEntryMessage[][]
	errorCount: number
}

export interface GameHistoryPlayerDatabaseEntry {
	id: string
	groupId: string
	username: string
}
