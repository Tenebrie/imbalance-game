import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentPeasant from './GwentPeasant'

export default class GwentPeasantMilitia extends ServerCard {
	public static readonly PEASANTS = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.TACTIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentPeasant],
		})
		this.dynamicTextVariables = {
			peasants: GwentPeasantMilitia.PEASANTS,
		}

		this.createLocalization({
			en: {
				name: 'Peasant Militia',
				description: '*Spawn* {peasants} *Peasants* on a row.',
				flavor: "We's the militia. We keep the peace.",
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW).perform(({ targetRow }) => {
			const owner = targetRow.owner
			if (!owner) {
				return
			}
			Keywords.summonMultipleUnits({
				owner: owner.players[0],
				cardConstructor: GwentPeasant,
				rowIndex: targetRow.index,
				unitIndex: targetRow.farRightUnitIndex,
				count: GwentPeasantMilitia.PEASANTS,
			})
		})
	}
}
