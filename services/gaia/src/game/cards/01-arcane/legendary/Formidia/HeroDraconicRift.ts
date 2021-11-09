import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import HeroFormidia from '@src/game/cards/01-arcane/legendary/Formidia/HeroFormidia'
import GameEventCreators from '@src/game/models/events/GameEventCreators'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class HeroDraconicRift extends ServerCard {
	powerPerMana = 2
	powerThreshold = 80

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 0,
				armor: 15,
			},
			relatedCards: [HeroFormidia],
			expansionSet: ExpansionSet.BASE,
			generatedArtworkMagicString: '9',
		})
		this.dynamicTextVariables = {
			powerPerMana: this.powerPerMana,
			powerThreshold: this.powerThreshold,
		}

		this.createLocalization({
			en: {
				name: 'Formidia',
				title: 'The Exiled',
				description:
					"*Turn end:*<br>*Consume* adjacent units.<p>If this card's Power reaches {powerThreshold}, *Transform* into *Formidia, the Returned* triggering her *Deploy* effect.",
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group === this.ownerGroup)
			.perform(() => {
				const unit = this.unit!
				const adjacentUnits = game.board.getAdjacentUnits(unit)
				Keywords.consume.units({
					targets: adjacentUnits,
					consumer: this,
				})

				if (this.stats.power >= this.powerThreshold) {
					const owner = this.ownerPlayer
					const newUnit = Keywords.transformUnit(unit, HeroFormidia)
					if (!newUnit) {
						return
					}
					game.events.postEvent(
						GameEventCreators.unitDeployed({
							game,
							owner,
							triggeringUnit: newUnit,
						}),
						[newUnit.card]
					)
				}
			})
	}
}
