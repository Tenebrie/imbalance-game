import CardType from '../../shared/enums/CardType'
import CardColor from '../../shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import BuffImmunity from '../../buffs/BuffImmunity'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import ServerGameBoardRow from '../../models/ServerGameBoardRow'

export default class HeroZamarath extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN)
		this.basePower = 15
	}

	onPlayedAsUnit(thisUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): void {
		this.cardBuffs.add(new BuffImmunity(), this, Infinity)
	}
}
