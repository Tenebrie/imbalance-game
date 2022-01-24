type ProfilerValue = {
	key: string
	calls: number
	total: number
	average: number
	isAsync: boolean
}

class Profiler {
	totalTime = 0
	totalSyncTime = 0
	totalAsyncTime = 0
	data: Record<string, ProfilerValue> = {}

	wrapArrowFunction<T>(fullName: string, isAsync: boolean, callback: (...args: any[]) => T): (...args: any[]) => T {
		return (...args) => {
			const startTime = this.startTimingFunction(fullName)
			const result = callback(...args)
			this.stopTimingFunction(fullName, startTime, isAsync)
			return result
		}
	}

	startTimingFunction(fullName: string): number {
		return performance.now()
	}

	stopTimingFunction(fullName: string, startTime: number, isAsync: boolean): void {
		const timeDiff = performance.now() - startTime

		this.totalTime += timeDiff
		if (isAsync) {
			this.totalAsyncTime += timeDiff
		} else {
			this.totalSyncTime += timeDiff
		}
		const record: ProfilerValue = this.data[fullName] || {
			key: fullName,
			calls: 0,
			total: 0,
			average: 0,
			isAsync,
		}

		record.average = (record.average * record.calls + timeDiff) / (record.calls + 1)
		record.calls += 1
		record.total += timeDiff
		this.data[fullName] = record
	}
}

export default new Profiler()
