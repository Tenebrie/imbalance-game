import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation, shuffle } from '@src/utils/Utils'
import CardLibrary from '@src/game/libraries/CardLibrary'
import TargetType from '@shared/enums/TargetType'

abstract class BaseSpellLabyrinthRewardBucket extends ServerCard {
	cardsChosen: ServerCard[] = []

	protected constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})

		this.createCallback(GameEventType.CARD_PLAYED, AnyCardLocation)
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(() => chooseRewards())

		const chooseRewards = () => {
			this.cardsChosen = shuffle(CardLibrary.cards.filter((card) => card.stats.basePower >= 15).filter((card) => card.isCollectible)).slice(
				0,
				this.rewardsOffered
			)
		}

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.cardsChosen.includes(targetCard))
			.perform(({ targetCard }) => {
				this.game.progression.labyrinth.addCardToDeck(targetCard.class, 3)
			})
	}

	public abstract readonly rewardsOffered: number
	protected abstract isCardValidReward(card: ServerCard): boolean
}

export class SpellLabyrinthRewardBucketStrong extends BaseSpellLabyrinthRewardBucket {
	public readonly rewardsOffered = 4
	protected isCardValidReward(card: ServerCard): boolean {
		return card.stats.basePower >= 15
	}
}
export class SpellLabyrinthRewardBucketWeak extends BaseSpellLabyrinthRewardBucket {
	public readonly rewardsOffered = 4
	protected isCardValidReward(card: ServerCard): boolean {
		return card.stats.basePower <= 5
	}
}
