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
import CardFeature from '@shared/enums/CardFeature'
import { sortCards } from '@shared/Utils'
import CardTribe from '@shared/enums/CardTribe'

abstract class BaseSpellLabyrinthRewardTreasure extends ServerCard {
	cardsChosen: ServerCard[] = []

	public constructor(game: ServerGame) {
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
			const validCards = CardLibrary.cards.filter(this.isCardValidTreasure)
			this.cardsChosen = sortCards(shuffle(validCards).slice(0, this.rewardsOffered))
		}

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.cardsChosen.includes(targetCard))
			.preventSorting()
			.perform(({ player, targetCard }) => {
				this.game.progression.labyrinth.addItemToDeck(player.player, targetCard.class)
			})
	}

	public abstract readonly rewardsOffered: number
	protected abstract isCardValidTreasure(card: ServerCard): boolean
}

export class SpellLabyrinthRewardTreasureT1 extends BaseSpellLabyrinthRewardTreasure {
	public readonly rewardsOffered = 4
	protected isCardValidTreasure(card: ServerCard): boolean {
		return card.features.includes(CardFeature.LABYRINTH_ITEM_T1) && card.tribes.includes(CardTribe.LABYRINTH_TREASURE)
	}
}

export class SpellLabyrinthRewardTreasureT2 extends BaseSpellLabyrinthRewardTreasure {
	public readonly rewardsOffered = 4
	protected isCardValidTreasure(card: ServerCard): boolean {
		return card.features.includes(CardFeature.LABYRINTH_ITEM_T2) && card.tribes.includes(CardTribe.LABYRINTH_TREASURE)
	}
}

export class SpellLabyrinthRewardTreasureT3 extends BaseSpellLabyrinthRewardTreasure {
	public readonly rewardsOffered = 4
	protected isCardValidTreasure(card: ServerCard): boolean {
		return card.features.includes(CardFeature.LABYRINTH_ITEM_T3) && card.tribes.includes(CardTribe.LABYRINTH_TREASURE)
	}
}

export class SpellLabyrinthRewardTreasureT4 extends BaseSpellLabyrinthRewardTreasure {
	public readonly rewardsOffered = 4
	protected isCardValidTreasure(card: ServerCard): boolean {
		return card.features.includes(CardFeature.LABYRINTH_ITEM_T4) && card.tribes.includes(CardTribe.LABYRINTH_TREASURE)
	}
}
