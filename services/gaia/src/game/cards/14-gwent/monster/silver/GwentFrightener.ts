import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentSingleUsed from '@src/game/buffs/14-gwent/BuffGwentSingleUsed'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentFrightener extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CONSTRUCT],
			features: [CardFeature.SPY],
			stats: {
				power: 13,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Frightener',
				description: '*Single-Use:* Move an enemy to this row and draw a card.',
				flavor: '"What have I done?" the mage cried out, frightened of his own creation.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(() => !this.buffs.has(BuffGwentSingleUsed))
			.requireAllied()
			.requireNotSelf()
			.require(() => !!this.unit)
			.perform(({ targetUnit }) => {
				this.buffs.add(BuffGwentSingleUsed, this)
				game.board.moveUnitToFarRight(targetUnit, this.unit!.rowIndex)
				Keywords.draw.topUnitCard(this.ownerPlayer.opponent.players[0])
			})
	}
}
