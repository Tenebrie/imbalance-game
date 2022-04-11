import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import BuffStrength from '@src/game/buffs/BuffStrength'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentNekker extends ServerCard {
	public static readonly EXTRA_POWER = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			extraPower: GwentNekker.EXTRA_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Nekker',
				description:
					'If in hand, deck, or on board, boost self by {extraPower} whenever you *Consume* a card.<p>*Deathwish:* *Summon* a copy of this unit to the same position.',
				flavor: 'These little guys are almost cute, if you ignore the whole vicious killer aspect.',
			},
		})

		this.createCallback(GameEventType.UNIT_CONSUMED, [CardLocation.HAND, CardLocation.BOARD, CardLocation.DECK])
			.require(({ consumer }) => consumer.ownerGroup.owns(this))
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentNekker.EXTRA_POWER, this)
			})

		this.createEffect(GameEventType.AFTER_UNIT_DESTROYED)
			.require(({ reason }) => reason === UnitDestructionReason.CARD_EFFECT)
			.perform(({ owner, rowIndex, unitIndex }) => {
				const otherCopies = owner.cardDeck.allCards.filter((card) => card.class === this.class)
				if (otherCopies.length === 0) {
					return
				}

				Keywords.summonUnitFromDeck({
					card: otherCopies[0],
					owner,
					rowIndex,
					unitIndex,
				})
			})
	}
}
