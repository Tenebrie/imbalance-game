import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { sortCards } from '@shared/Utils'
import CardLibrary from '@src/game/libraries/CardLibrary'
import { AnyCardLocation, shuffle } from '@src/utils/Utils'

import ServerCard, { ServerCardProps } from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

const isCardVisibleInLabyrinth = (card: ServerCard): boolean => {
	return (
		(card.isCollectible || card.expansionSet === ExpansionSet.LABYRINTH) &&
		card.type === CardType.UNIT &&
		card.color !== CardColor.LEADER &&
		card.color !== CardColor.TOKEN
	)
}

abstract class BaseSpellLabyrinthRewardBucket extends ServerCard {
	cardsToChooseFrom: ServerCard[] = []

	protected constructor(game: ServerGame, props: Partial<ServerCardProps> = {}) {
		super(game, {
			...props,
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.LABYRINTH_BUCKET],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			rewardsOffered: () => this.rewardsOffered,
		}

		this.createCallback(GameEventType.CARD_PLAYED, AnyCardLocation)
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(() => chooseRewards())

		const chooseRewards = () => {
			const validCards = CardLibrary.cards.filter(this.isCardValidReward).filter((card) => isCardVisibleInLabyrinth(card))
			this.cardsToChooseFrom = sortCards(shuffle(validCards).slice(0, this.rewardsOffered))
		}

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.cardsToChooseFrom.includes(targetCard))
			.preventSorting()
			.perform(({ player, targetCard }) => {
				this.game.progression.labyrinth.addCardToDeck(player.player, targetCard.class, 1)
			})
	}

	public abstract readonly rewardsOffered: number
	protected abstract isCardValidReward(card: ServerCard): boolean
}

export class SpellLabyrinthRewardBucketStrong extends BaseSpellLabyrinthRewardBucket {
	public static readonly MIN_POWER = 15

	constructor(game: ServerGame) {
		super(game)
		this.dynamicTextVariables = {
			...this.dynamicTextVariables,
			minPower: SpellLabyrinthRewardBucketStrong.MIN_POWER,
		}
		this.addRelatedCards()
			.require(isCardVisibleInLabyrinth)
			.require((card) => card.stats.basePower >= SpellLabyrinthRewardBucketStrong.MIN_POWER)
	}

	public readonly rewardsOffered = 4
	protected isCardValidReward(card: ServerCard): boolean {
		return card.stats.basePower >= SpellLabyrinthRewardBucketStrong.MIN_POWER
	}
}
export class SpellLabyrinthRewardBucketWeak extends BaseSpellLabyrinthRewardBucket {
	public static readonly MAX_POWER = 5

	constructor(game: ServerGame) {
		super(game)
		this.dynamicTextVariables = {
			...this.dynamicTextVariables,
			maxPower: SpellLabyrinthRewardBucketWeak.MAX_POWER,
		}
		this.addRelatedCards()
			.require(isCardVisibleInLabyrinth)
			.require((card) => card.stats.basePower <= SpellLabyrinthRewardBucketWeak.MAX_POWER)
	}

	public readonly rewardsOffered = 5
	protected isCardValidReward(card: ServerCard): boolean {
		return card.stats.basePower <= SpellLabyrinthRewardBucketWeak.MAX_POWER
	}
}

export class SpellLabyrinthRewardBucketArmored extends BaseSpellLabyrinthRewardBucket {
	constructor(game: ServerGame) {
		super(game)
		this.addRelatedCards()
			.require(isCardVisibleInLabyrinth)
			.require((card) => card.stats.baseArmor > 0)
	}

	public readonly rewardsOffered = 5
	protected isCardValidReward(card: ServerCard): boolean {
		return card.stats.baseArmor > 0
	}
}

export class SpellLabyrinthRewardBucketMerfolk extends BaseSpellLabyrinthRewardBucket {
	constructor(game: ServerGame) {
		super(game)
		this.addRelatedCards().require(isCardVisibleInLabyrinth).requireTribe(CardTribe.MERFOLK)
	}

	public readonly rewardsOffered = 5
	protected isCardValidReward(card: ServerCard): boolean {
		return card.tribes.includes(CardTribe.MERFOLK)
	}
}

export class SpellLabyrinthRewardBucketBirds extends BaseSpellLabyrinthRewardBucket {
	constructor(game: ServerGame) {
		super(game)
		this.addRelatedCards().require(isCardVisibleInLabyrinth).requireTribe(CardTribe.BIRD)
	}

	public readonly rewardsOffered = 5
	protected isCardValidReward(card: ServerCard): boolean {
		return card.tribes.includes(CardTribe.BIRD)
	}
}

export class SpellLabyrinthRewardBucketPeasants extends BaseSpellLabyrinthRewardBucket {
	constructor(game: ServerGame) {
		super(game)
		this.addRelatedCards().require(isCardVisibleInLabyrinth).requireTribe(CardTribe.COMMONER)
	}

	public readonly rewardsOffered = 5
	protected isCardValidReward(card: ServerCard): boolean {
		return card.tribes.includes(CardTribe.COMMONER)
	}
}

export class SpellLabyrinthRewardBucketNobles extends BaseSpellLabyrinthRewardBucket {
	constructor(game: ServerGame) {
		super(game)
		this.addRelatedCards().require(isCardVisibleInLabyrinth).requireTribe(CardTribe.NOBLE)
	}

	public readonly rewardsOffered = 5
	protected isCardValidReward(card: ServerCard): boolean {
		return card.tribes.includes(CardTribe.NOBLE)
	}
}

export class SpellLabyrinthRewardBucketForest extends BaseSpellLabyrinthRewardBucket {
	constructor(game: ServerGame) {
		super(game)
		this.addRelatedCards().require(isCardVisibleInLabyrinth).requireAnyTribe([CardTribe.BEAST, CardTribe.DRYAD])
	}

	public readonly rewardsOffered = 5
	protected isCardValidReward(card: ServerCard): boolean {
		return card.tribes.includes(CardTribe.BEAST) || card.tribes.includes(CardTribe.DRYAD)
	}
}

export class SpellLabyrinthRewardBucketLost extends BaseSpellLabyrinthRewardBucket {
	constructor(game: ServerGame) {
		super(game)
		this.addRelatedCards().require(isCardVisibleInLabyrinth).requireTribe(CardTribe.LOST)
	}

	public readonly rewardsOffered = 6
	protected isCardValidReward(card: ServerCard): boolean {
		return card.tribes.includes(CardTribe.LOST)
	}
}

// export class SpellLabyrinthRewardBucketHeals extends BaseSpellLabyrinthRewardBucket {
// 	constructor(game: ServerGame) {
// 		super(game, {
// 			features: [CardFeature.KEYWORD_HEAL],
// 		})
// 		this.addRelatedCards().require(isCardVisibleInLabyrinth).requireFeature(CardFeature.KEYWORD_HEAL)
// 	}
//
// 	public readonly rewardsOffered = 3
// 	protected isCardValidReward(card: ServerCard): boolean {
// 		return card.features.includes(CardFeature.KEYWORD_HEAL)
// 	}
// }

export class SpellLabyrinthRewardBucketRandom extends BaseSpellLabyrinthRewardBucket {
	constructor(game: ServerGame) {
		super(game)
	}

	public readonly rewardsOffered = 10
	protected isCardValidReward(): boolean {
		return true
	}
}
