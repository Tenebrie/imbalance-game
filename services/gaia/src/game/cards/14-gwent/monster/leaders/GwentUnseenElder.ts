import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import { getLeaderTextVariables } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentUnseenElder extends ServerCard {
	exploredCards: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.VAMPIRE],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			...getLeaderTextVariables(this),
		}

		this.createLocalization({
			en: {
				name: '<if inGame>{playerName}</if><ifn inGame>Unseen Elder</if>',
				title: '<if inGame>as Unseen Elder</if>',
				listName: 'Unseen Elder',
				description: '*Drain* a unit by half.',
				flavor:
					'No one, not even among the higher vampires, knows exactly how old the Unseen Elder is. They only know they should never, under any circumstances, defy his will.',
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			const damage = Math.floor(targetUnit.card.stats.power / 2)
			targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
			this.buffs.addMultiple(BuffStrength, damage, targetUnit.card)
		})
	}
}
