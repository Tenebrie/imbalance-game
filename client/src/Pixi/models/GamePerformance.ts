export default class GamePerformance {
	private actionTimestamp: number | null = null
	private acknowledgeTimestamp: number | null = null
	private flushTimestamp: number | null = null

	public logPlayerAction(): void {
		if (this.actionTimestamp === null) {
			this.actionTimestamp = performance.now()
		}
	}

	public logMessageAcknowledge(): void {
		if (this.acknowledgeTimestamp === null && this.actionTimestamp !== null) {
			this.acknowledgeTimestamp = performance.now()
		}
	}

	public logQueueFlush(): void {
		if (this.flushTimestamp === null && this.acknowledgeTimestamp !== null && this.actionTimestamp !== null) {
			this.flushTimestamp = performance.now()
		}
	}

	public logServerResponse(serverLoad: number): void {
		if (this.actionTimestamp === null || this.acknowledgeTimestamp === null || this.flushTimestamp === null) {
			return
		}

		const actionToResponse = Math.round(this.acknowledgeTimestamp - this.actionTimestamp)
		const actionToFlush = Math.round(this.flushTimestamp - this.acknowledgeTimestamp)
		console.info(`[Perf] Ack in ${actionToResponse}ms | Flush in ${actionToFlush}ms | Server time: ${Math.round(serverLoad)}ms`)
		this.actionTimestamp = null
		this.acknowledgeTimestamp = null
		this.flushTimestamp = null
	}
}
