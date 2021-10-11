import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import ServerCard from '../../../models/ServerCard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class TutorialUnitWoundedVeteran extends ServerCard {
	damageToSelf = 20

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.COMMONER, CardTribe.SOLDIER],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 40,
			},
			expansionSet: ExpansionSet.TUTORIAL,
		})
		this.dynamicTextVariables = {
			damageToSelf: this.damageToSelf,
		}

		this.createLocalization({
			en: {
				name: 'Wounded Veteran',
				description: '*Deploy:*\nDeal {damageToSelf} Damage to self.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		this.dealDamage(ServerDamageInstance.fromCard(this.damageToSelf, this))
	}
}
