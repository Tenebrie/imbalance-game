import { ServerToClientGameMessageSelector, ServerToClientMessageTypeMappers } from '../messageHandlers/ServerToClientGameMessages'

export default class BundleLoopMessage<K extends keyof ServerToClientMessageTypeMappers> {
	public readonly loopedType: K
	public readonly loopedArgs: ServerToClientMessageTypeMappers[K][]
	public readonly highPriority?: boolean
	public readonly ignoreWorkerThreads?: boolean
	public readonly allowBatching?: boolean

	constructor(items: ServerToClientGameMessageSelector<K>[]) {
		const masterItem = items[0]
		if (!masterItem) {
			throw new Error("Items array can't be empty!")
		}
		this.loopedType = masterItem.type
		this.loopedArgs = items.map((item) => item.data)
		this.highPriority = masterItem.highPriority
		this.ignoreWorkerThreads = masterItem.ignoreWorkerThreads
		this.allowBatching = masterItem.allowBatching
	}

	static unwrap<K extends keyof ServerToClientMessageTypeMappers>(group: BundleLoopMessage<K>): ServerToClientGameMessageSelector<K>[] {
		return group.loopedArgs.map((args) => ({
			type: group.loopedType,
			data: args,
			highPriority: group.highPriority,
			ignoreWorkerThreads: group.ignoreWorkerThreads,
			allowBatching: group.allowBatching,
		}))
	}
}
