import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentMandrakeStrengthen from './GwentMandrakeStrengthen'
import GwentMandrakeWeaken from './GwentMandrakeWeaken'

export default class GwentMandrake extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentMandrakeStrengthen, GwentMandrakeWeaken],
		})

		this.createLocalization({
			en: {
				name: 'Mandrake',
				description: '*Spawn* either an *Envigorating Mandrake* or an *Enfeebling Mandrake*.',
				flavor: `There you all stand! With wonderment awake, doubting the plan and high-discovery. Some, as if grappled by the fell mandrake, some, by the black dog's devilry.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard instanceof GwentMandrakeStrengthen || targetCard instanceof GwentMandrakeWeaken)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
