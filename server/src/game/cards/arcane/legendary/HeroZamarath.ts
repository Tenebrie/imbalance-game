import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent from '../../../models/GameEvent'
import BuffImmunity from '../../../buffs/BuffImmunity'
import BuffDuration from '@shared/enums/BuffDuration'

export default class HeroZamarath extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 12
		this.baseArmor = 5

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => {
				this.buffs.add(BuffImmunity, this, BuffDuration.START_OF_NEXT_TURN)
			})
	}
}
