import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent, {UnitPlayedEventArgs} from '../../../models/GameEvent'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import ServerAnimation from '../../../models/ServerAnimation'

export default class HeroForksmanshipInstructor extends ServerCard {
	powerThreshold = 4
	bonusPower = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.NEUTRAL)
		this.basePower = 8
		this.dynamicTextVariables = {
			powerThreshold: this.powerThreshold,
			bonusPower: this.bonusPower
		}

		this.createCallback<UnitPlayedEventArgs>(GameEvent.UNIT_PLAYED)
			.requireLocation(CardLocation.BOARD)
			.require(({ playedUnit }) => playedUnit.card !== this)
			.require(({ playedUnit }) => playedUnit.owner === this.owner)
			.require(({ playedUnit }) => playedUnit.card.power <= this.powerThreshold)
			.perform(({ playedUnit }) => {
				game.animation.play(ServerAnimation.cardAttacksUnits(this, [playedUnit]))
				playedUnit.buffs.addMultiple(BuffStrength, this.bonusPower, this, BuffDuration.INFINITY)
			})
	}
}
