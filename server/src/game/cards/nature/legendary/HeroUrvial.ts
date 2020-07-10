import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent from '../../../models/GameEvent'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffUpgradedStorms from '../../../buffs/BuffUpgradedStorms'
import CardTribe from '@shared/enums/CardTribe'

export default class HeroUrvial extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.NATURE)
		this.basePower = 10
		this.baseTribes = [CardTribe.MERFOLK]

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => {
				this.owner.leader.buffs.add(BuffUpgradedStorms, this, BuffDuration.INFINITY)
			})
	}
}
