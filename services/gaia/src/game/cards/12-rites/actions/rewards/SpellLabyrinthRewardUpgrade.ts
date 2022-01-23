import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { sortCards } from '@shared/Utils'
import CardLibrary from '@src/game/libraries/CardLibrary'
import { AnyCardLocation, getClassFromConstructor, shuffle } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

abstract class BaseSpellLabyrinthRewardUpgrade extends ServerCard {
	cardsChosen: ServerCard[] = []

	public constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.RITES,
		})

		this.createCallback(GameEventType.CARD_PLAYED, AnyCardLocation)
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(() => chooseRewards())

		const chooseRewards = () => {
			const validCards = CardLibrary.cards.filter(this.isCardValidUpgrade)
			this.cardsChosen = sortCards(shuffle(validCards).slice(0, this.rewardsOffered))
		}

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.cardsChosen.includes(targetCard))
			.preventSorting()
			.perform(({ player, targetCard }) => {
				this.game.progression.rites.addItemToDeck(player.player, targetCard.class)
			})
	}

	public abstract readonly rewardsOffered: number
	protected abstract isCardValidUpgrade(card: ServerCard): boolean
}

export class SpellLabyrinthRewardUpgradeAny extends BaseSpellLabyrinthRewardUpgrade {
	public readonly rewardsOffered = 4
	protected isCardValidUpgrade(card: ServerCard): boolean {
		const upgradeableCards = this.ownerPlayer.cardHand.allCards.filter(
			(filteredCard) => filteredCard.upgrades.length > 0 && filteredCard.features.includes(CardFeature.RITES_ITEM)
		)
		const validCardClasses = upgradeableCards
			.flatMap((upgradeableCard) => upgradeableCard.upgrades)
			.map((constructor) => getClassFromConstructor(constructor))
		return validCardClasses.includes(card.class)
	}
}
