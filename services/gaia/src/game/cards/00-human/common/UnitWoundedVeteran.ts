import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class UnitWoundedVeteran extends ServerCard {
	damageToSelf = 20

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.COMMONER, CardTribe.SOLDIER],
			stats: {
				power: 40,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damageToSelf: this.damageToSelf,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		this.dealDamage(DamageInstance.fromCard(this.damageToSelf, this))
	}
}
