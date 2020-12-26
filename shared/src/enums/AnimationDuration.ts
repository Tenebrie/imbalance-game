import AnimationType from './AnimationType'

const AnimationDuration: { [index in AnimationType]: number } = {
	[AnimationType.NULL]: 0,
	[AnimationType.DELAY]: 500,
	[AnimationType.CARD_DRAW]: 500,
	[AnimationType.CARD_ANNOUNCE]: 2000,
	[AnimationType.CARD_ATTACK]: 500,
	[AnimationType.CARD_AFFECT]: 500,
	[AnimationType.CARD_HEAL]: 500,
	[AnimationType.POST_CARD_ATTACK]: 100,
	[AnimationType.UNIVERSE_ATTACK]: 500,
	[AnimationType.UNIVERSE_AFFECT]: 500,
	[AnimationType.UNIVERSE_HEAL]: 500,
	[AnimationType.UNIT_DEPLOY]: 750,
	[AnimationType.UNIT_DESTROY]: 500,
	[AnimationType.UNIT_MOVE]: 750,
	[AnimationType.CARD_RECEIVED_BUFF]: 500,
	[AnimationType.CARD_INFUSE]: 500,
	[AnimationType.CARD_GENERATE_MANA]: 500,
}

export default AnimationDuration
