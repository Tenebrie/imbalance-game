import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { PartialCardLocalization } from '@shared/models/cardLocalization/CardLocalization'
import { sortCards } from '@shared/Utils'
import CardLibrary from '@src/game/libraries/CardLibrary'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
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

		this.createLocalization(this.getLocalization())

		this.createCallback(GameEventType.CARD_PLAYED, AnyCardLocation)
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(({ owner }) => chooseRewards(owner))

		const chooseRewards = (owner: ServerPlayerInGame) => {
			const validCards = CardLibrary.cards.filter((card) => this.isCardValidUpgrade(owner, card))
			this.cardsChosen = sortCards(shuffle(validCards).slice(0, this.rewardsOffered))
		}

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => this.cardsChosen.includes(targetCard))
			.preventSorting()
			.perform(({ player, targetCard }) => {
				this.game.progression.rites.addItemToDeck(player.player, targetCard.class)

				const whitelistedTribes = [CardTribe.RITES_WEAPON, CardTribe.RITES_ARMOR, CardTribe.RITES_GLOVES, CardTribe.RITES_BOOTS]
				whitelistedTribes.forEach((tribe) => {
					if (targetCard.tribes.includes(tribe)) {
						player.cardHand.allCards.filter((card) => card.tribes.includes(tribe)).forEach((card) => player.cardHand.removeCard(card))
					}
				})
				player.cardHand.addSpell(CardLibrary.instantiateFromInstance(game, targetCard))
			})
	}

	public abstract readonly rewardsOffered: number
	protected abstract getLocalization(): PartialCardLocalization
	protected abstract isCardValidUpgrade(owner: ServerPlayerInGame, card: ServerCard): boolean
}

export class SpellLabyrinthRewardUpgradeAny extends BaseSpellLabyrinthRewardUpgrade {
	public readonly rewardsOffered = 4

	protected getLocalization(): PartialCardLocalization {
		return {
			en: {
				name: 'Upgrade!',
				title: 'Action',
				description: 'Upgrade any item.',
			},
		}
	}

	protected isCardValidUpgrade(owner: ServerPlayerInGame, card: ServerCard): boolean {
		const upgradeableCards = owner.cardHand.allCards.filter(
			(filteredCard) => filteredCard.upgrades.length > 0 && filteredCard.features.includes(CardFeature.RITES_ITEM)
		)
		const validCardClasses = upgradeableCards
			.flatMap((upgradeableCard) => upgradeableCard.upgrades)
			.map((constructor) => getClassFromConstructor(constructor))
		return validCardClasses.includes(card.class)
	}
}
