import {
	AnimationMessageType,
	AnimationMessageTypeMapping,
	BundleMessageType,
	BundleMessageTypeMapping,
	ServerToClientGameMessageSelector,
} from '../messageHandlers/ServerToClientGameMessages'

type Bundle = {
	animation: ServerToClientGameMessageSelector<AnimationMessageType.PLAY>
	buffBundle: ServerToClientGameMessageSelector<BundleMessageType.CARD_BUFF>
}

export default class BundleCardBuffWithAffectMessage {
	public readonly animationData: AnimationMessageTypeMapping[AnimationMessageType.PLAY]
	public readonly buffBundleData: BundleMessageTypeMapping[BundleMessageType.CARD_BUFF]

	constructor(args: Bundle) {
		this.animationData = args.animation.data
		this.buffBundleData = args.buffBundle.data
	}

	static unwrap(
		group: BundleCardBuffWithAffectMessage
	): [ServerToClientGameMessageSelector<AnimationMessageType.PLAY>, ServerToClientGameMessageSelector<BundleMessageType.CARD_BUFF>] {
		return [
			{
				type: AnimationMessageType.PLAY,
				data: group.animationData,
			},
			{
				type: BundleMessageType.CARD_BUFF,
				data: group.buffBundleData,
				skipQueue: true,
			},
		]
	}
}
