import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitWoundedVeteran from '@src/game/cards/00-human/common/UnitWoundedVeteran'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import { DamageInstance } from '../../../models/ServerDamageSource'

export default class TutorialUnitWoundedVeteran extends ServerCard {
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
			sharedArtwork: UnitWoundedVeteran,
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
		this.dealDamage(DamageInstance.fromCard(this.damageToSelf, this))
	}
}
