export default interface GameHistoryDatabaseEntry {
	id: string
	startedAt: string
	closedAt: string | null
	closeReason: string
	victoriousPlayer: { id: string; username: string } | null
	players: { id: string; username: string }[]
	eventLog: any[]
}
