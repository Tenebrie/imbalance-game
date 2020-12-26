export default class GamePerformance {
	private actionTimestamp: number | null = null
	private responseTimestamp: number | null = null

	public logPlayerAction(): void {
		if (this.actionTimestamp === null) {
			this.actionTimestamp = performance.now()
		}
	}

	public logServerResponse(): void {
		if (this.responseTimestamp === null && this.actionTimestamp !== null) {
			this.responseTimestamp = performance.now()
		}
	}

	public logQueueExecution(): void {
		if (this.actionTimestamp === null || this.responseTimestamp === null) {
			return
		}

		const flushTimestamp = performance.now()
		const actionToResponse = Math.round(this.responseTimestamp - this.actionTimestamp)
		const actionToFlush = Math.round(flushTimestamp - this.responseTimestamp)
		console.info(`[Perf] Ping: ${actionToResponse}ms; Server load: ${actionToFlush}ms`)
		this.actionTimestamp = null
		this.responseTimestamp = null
	}
}
