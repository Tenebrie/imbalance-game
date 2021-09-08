import AnimationThreadStartMessage from '../AnimationThreadStartMessage'
import { AnimationMessageType, ServerToClientGameMessageSelector } from '../messageHandlers/ServerToClientGameMessages'

type Bundle = {
	commitMessage: ServerToClientGameMessageSelector<AnimationMessageType.THREAD_COMMIT>
	createMessage: ServerToClientGameMessageSelector<AnimationMessageType.THREAD_CREATE>
	startMessage: ServerToClientGameMessageSelector<AnimationMessageType.THREAD_START>
}

export default class BundleNextThreadMessage {
	private readonly innerData: AnimationThreadStartMessage

	constructor(args: Bundle) {
		this.innerData = args.createMessage.data
	}

	static unwrap(
		group: BundleNextThreadMessage
	): [
		ServerToClientGameMessageSelector<AnimationMessageType.THREAD_COMMIT>,
		ServerToClientGameMessageSelector<AnimationMessageType.THREAD_CREATE>,
		ServerToClientGameMessageSelector<AnimationMessageType.THREAD_START>
	] {
		return [
			{
				type: AnimationMessageType.THREAD_COMMIT,
				data: null,
				highPriority: true,
			},
			{
				type: AnimationMessageType.THREAD_CREATE,
				data: new AnimationThreadStartMessage(group.innerData.isStaggered),
				highPriority: true,
			},
			{
				type: AnimationMessageType.THREAD_START,
				data: new AnimationThreadStartMessage(group.innerData.isStaggered),
				allowBatching: true,
				ignoreWorkerThreads: true,
			},
		]
	}
}
