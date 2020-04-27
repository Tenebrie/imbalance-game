import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import BuffImmunity from '../../buffs/BuffImmunity'
import ServerUnit from '../../models/ServerUnit'
import ServerBoardRow from '../../models/ServerBoardRow'
import CardFaction from '@shared/enums/CardFaction'

export default class HeroZamarath extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 15
	}

	onPlayedAsUnit(thisUnit: ServerUnit, targetRow: ServerBoardRow): void {
		this.buffs.add(new BuffImmunity(), this, Infinity)
	}
}
