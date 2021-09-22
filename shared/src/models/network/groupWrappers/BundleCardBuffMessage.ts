import {
	AnimationMessageType,
	AnimationMessageTypeMapping,
	BundleMessageType,
	BundleMessageTypeMapping,
	CardUpdateMessageType,
	CardUpdateMessageTypeMapping,
	ServerToClientGameMessageSelector,
} from '../messageHandlers/ServerToClientGameMessages'

type Bundle = {
	buffAdd: ServerToClientGameMessageSelector<CardUpdateMessageType.CARD_BUFF_ADD>
	cardStats: ServerToClientGameMessageSelector<CardUpdateMessageType.STATS>
	animationPlay: ServerToClientGameMessageSelector<AnimationMessageType.PLAY>
	nextThread: ServerToClientGameMessageSelector<BundleMessageType.THREAD_NEXT>
}

export default class BundleCardBuffMessage {
	public readonly buffData: CardUpdateMessageTypeMapping[CardUpdateMessageType.CARD_BUFF_ADD]
	public readonly cardStats: CardUpdateMessageTypeMapping[CardUpdateMessageType.STATS]
	public readonly animation: AnimationMessageTypeMapping[AnimationMessageType.PLAY]
	public readonly nextThread: BundleMessageTypeMapping[BundleMessageType.THREAD_NEXT]

	constructor(args: Bundle) {
		this.buffData = args.buffAdd.data
		this.cardStats = args.cardStats.data
		this.animation = args.animationPlay.data
		this.nextThread = args.nextThread.data
	}

	static unwrap(
		group: BundleCardBuffMessage
	): [
		ServerToClientGameMessageSelector<CardUpdateMessageType.CARD_BUFF_ADD>,
		ServerToClientGameMessageSelector<CardUpdateMessageType.STATS>,
		ServerToClientGameMessageSelector<AnimationMessageType.PLAY>,
		ServerToClientGameMessageSelector<BundleMessageType.THREAD_NEXT>
	] {
		return [
			{
				type: CardUpdateMessageType.CARD_BUFF_ADD,
				data: group.buffData,
			},
			{
				type: CardUpdateMessageType.STATS,
				data: group.cardStats,
			},
			{
				type: AnimationMessageType.PLAY,
				data: group.animation,
			},
			{
				type: BundleMessageType.THREAD_NEXT,
				data: group.nextThread,
				skipQueue: true,
			},
		]
	}
}
