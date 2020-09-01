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
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NATURE,
			tribes: [CardTribe.MERFOLK],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 8,
			}
		})
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => {
				this.owner.leader.buffs.add(BuffUpgradedStorms, this, BuffDuration.INFINITY)
			})
	}
}
