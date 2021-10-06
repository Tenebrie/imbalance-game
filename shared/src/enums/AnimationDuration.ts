import AnimationType from './AnimationType'

const AnimationDuration: { [index in AnimationType]: number } = {
	[AnimationType.NULL]: 0,
	[AnimationType.DELAY]: 0,
	[AnimationType.CARD_DRAW]: 500,
	[AnimationType.CARD_ANNOUNCE]: 2000,
	[AnimationType.CARD_ANNOUNCE_CLEAR]: 0,
	[AnimationType.CARD_ATTACK]: 500,
	[AnimationType.ROW_ATTACK]: 500,
	[AnimationType.CARD_AFFECT]: 500,
	[AnimationType.CARD_HEAL]: 500,
	[AnimationType.CARD_AFFECTS_ROWS]: 500,
	[AnimationType.ROW_AFFECTS_CARDS]: 500,
	[AnimationType.ROW_HEALS_CARDS]: 500,
	[AnimationType.ROW_AFFECTS_ROWS]: 500,
	[AnimationType.POST_CARD_ATTACK]: 100,
	[AnimationType.UNIVERSE_ATTACK]: 500,
	[AnimationType.UNIVERSE_AFFECT]: 500,
	[AnimationType.UNIVERSE_HEAL]: 500,
	[AnimationType.UNIT_DEPLOY]: 750,
	[AnimationType.UNIT_DESTROY]: 500,
	[AnimationType.UNIT_DESTROY_WITH_AFFECT]: 500,
	[AnimationType.UNIT_MOVE]: 750,
	[AnimationType.CARD_RECEIVED_BUFF]: 500,
	[AnimationType.ROWS_RECEIVED_BUFF]: 500,
	[AnimationType.CARDS_LOST_BUFF]: 0,
	[AnimationType.ROWS_LOST_BUFF]: 250,
	[AnimationType.CARD_INFUSE]: 500,
	[AnimationType.CARD_GENERATE_MANA]: 500,
	[AnimationType.SWITCHING_GAMES]: 0,
}

export default AnimationDuration
