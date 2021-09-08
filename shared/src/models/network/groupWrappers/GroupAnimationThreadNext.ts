import AnimationThreadStartMessage from '../AnimationThreadStartMessage'
import {
	AnimationMessageType,
	ServerToClientGameMessage,
	ServerToClientGameMessageSelector,
} from '../messageHandlers/ServerToClientGameMessages'

export default class GroupAnimationThreadNext {
	private readonly innerData: AnimationThreadStartMessage

	constructor(args: {
		commitMessage: ServerToClientGameMessageSelector<AnimationMessageType.THREAD_COMMIT>
		createMessage: ServerToClientGameMessageSelector<AnimationMessageType.THREAD_CREATE>
		startMessage: ServerToClientGameMessageSelector<AnimationMessageType.THREAD_START>
	}) {
		this.innerData = args.createMessage.data
	}

	static unwrap(
		group: GroupAnimationThreadNext
	): { commitMessage: ServerToClientGameMessage; createMessage: ServerToClientGameMessage; startMessage: ServerToClientGameMessage } {
		return {
			commitMessage: {
				type: AnimationMessageType.THREAD_COMMIT,
				data: null,
				highPriority: true,
			},
			createMessage: {
				type: AnimationMessageType.THREAD_CREATE,
				data: new AnimationThreadStartMessage(group.innerData.isStaggered),
				highPriority: true,
			},
			startMessage: {
				type: AnimationMessageType.THREAD_START,
				data: new AnimationThreadStartMessage(group.innerData.isStaggered),
				allowBatching: true,
				ignoreWorkerThreads: true,
			},
		}
	}
}
