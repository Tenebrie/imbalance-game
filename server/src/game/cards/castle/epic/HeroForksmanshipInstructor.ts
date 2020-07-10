import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent, {UnitCreatedEventArgs} from '../../../models/GameEvent'
import CardLocation from '@shared/enums/CardLocation'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import ServerAnimation from '../../../models/ServerAnimation'

export default class HeroForksmanshipInstructor extends ServerCard {
	powerThreshold = 4
	bonusPower = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.CASTLE)
		this.basePower = 8
		this.dynamicTextVariables = {
			powerThreshold: this.powerThreshold,
			bonusPower: this.bonusPower
		}

		this.createCallback<UnitCreatedEventArgs>(GameEvent.UNIT_CREATED)
			.requireLocation(CardLocation.BOARD)
			.require(({ createdUnit }) => createdUnit.card !== this)
			.require(({ createdUnit }) => createdUnit.owner === this.owner)
			.require(({ createdUnit }) => createdUnit.card.power <= this.powerThreshold)
			.perform(({ createdUnit }) => {
				game.animation.play(ServerAnimation.cardAttacksUnits(this, [createdUnit]))
				createdUnit.buffs.addMultiple(BuffStrength, this.bonusPower, this, BuffDuration.INFINITY)
			})
	}
}
