import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { asRecurringBuffPotency } from '@src/utils/LeaderStats'

import BuffStrength from '../../../buffs/BuffStrength'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroStormDancer extends ServerCard {
	normalPowerGiven = asRecurringBuffPotency(3)
	stormPowerGiven = asRecurringBuffPotency(5)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.WILD,
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.dynamicTextVariables = {
			powerGiven: this.normalPowerGiven,
			stormPowerGiven: this.stormPowerGiven,
		}
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createCallback(GameEventType.CARD_PLAYED, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.require(({ owner }) => owner === this.ownerPlayerNullable)
			.perform(({ triggeringCard }) => this.onSpellPlayed(triggeringCard))
	}

	private onSpellPlayed(playedCard: ServerCard): void {
		const adjacentUnits = this.game.board.getAdjacentUnits(this.unit)
		const isStorm = playedCard.tribes.includes(CardTribe.STORM)
		const powerGiven = isStorm ? this.stormPowerGiven : this.normalPowerGiven
		adjacentUnits.forEach((unit) => {
			unit.buffs.addMultiple(BuffStrength, powerGiven, this)
		})
	}
}
