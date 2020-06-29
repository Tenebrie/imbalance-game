import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLocation from '@shared/enums/CardLocation'
import GameEvent, {CardTakesDamageEventArgs} from '../../../models/GameEvent'

export default class HeroTroviar extends ServerCard {
	powerGained = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.NEUTRAL)
		this.basePower = 8
		this.dynamicTextVariables = {
			powerGained: this.powerGained
		}

		this.createCallback(GameEvent.CARD_TAKES_DAMAGE)
			.requireLocation(CardLocation.BOARD)
			.perform(() => this.onCardTakesDamage())
	}

	private onCardTakesDamage(): void {
		for (let i = 0; i < this.powerGained; i++) {
			this.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
		}
	}
}
