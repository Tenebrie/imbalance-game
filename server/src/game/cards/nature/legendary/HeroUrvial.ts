import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffUpgradedStorms from '../../../buffs/BuffUpgradedStorms'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'

export default class HeroUrvial extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.NATURE)
		this.basePower = 8
		this.baseTribes = [CardTribe.MERFOLK]
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => {
				this.owner.leader.buffs.add(BuffUpgradedStorms, this, BuffDuration.INFINITY)
			})
	}
}
