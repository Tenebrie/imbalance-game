import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '../../../buffs/BuffStrength'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import {asSplashBuffPotency} from '../../../../utils/LeaderStats'

export default class HeroStormDancer extends ServerCard {
	normalPowerGiven = asSplashBuffPotency(1)
	stormPowerGiven = asSplashBuffPotency(3)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.WILD,
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.dynamicTextVariables = {
			powerGiven: this.normalPowerGiven,
			stormPowerGiven: this.stormPowerGiven
		}
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createCallback(GameEventType.CARD_PLAYED, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.require(({ owner }) => owner === this.owner)
			.perform(({ triggeringCard }) => this.onSpellPlayed(triggeringCard))
	}

	private onSpellPlayed(playedCard: ServerCard): void {
		const adjacentUnits = this.game.board.getAdjacentUnits(this.unit)
		const isStorm = playedCard.tribes.includes(CardTribe.STORM)
		const powerGiven = isStorm ? this.stormPowerGiven : this.normalPowerGiven
		adjacentUnits.forEach(unit => {
			unit.buffs.addMultiple(BuffStrength, powerGiven, this)
		})
	}
}
