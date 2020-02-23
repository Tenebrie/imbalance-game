import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '../../shared/enums/CardColor'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerGameBoardRow from '../../models/ServerGameBoardRow'
import BuffSparksExtraDamage from '../../buffs/BuffSparksExtraDamage'

export default class HeroSparklingSpirit extends ServerCard {
	extraDamage = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER)
		this.basePower = 9
		this.dynamicTextVariables = {
			extraDamage: this.extraDamage
		}
	}

	onPlayedAsUnit(thisUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): void {
		for (let i = 0; i < this.extraDamage; i++) {
			this.cardBuffs.add(new BuffSparksExtraDamage(), this)
		}
	}
}
