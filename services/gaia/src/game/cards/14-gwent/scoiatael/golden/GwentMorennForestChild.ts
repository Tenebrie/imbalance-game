import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentAmbush from '@src/game/buffs/14-gwent/BuffGwentAmbush'
import GameHookType from '@src/game/models/events/GameHookType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMorennForestChild extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DRYAD],
			features: [CardFeature.AMBUSH],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Morenn: Forest Child',
				description: '*Ambush:* When your opponent plays a Bronze or Silver special card, flip over and cancel its ability.',
				flavor:
					'I hold Brokilon dearer than my own life. She is a mother who cares for her children. I will defend her to my final breath.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.buffs.add(BuffGwentAmbush, this)
		})

		this.createHook(GameHookType.CARD_DEPLOYED, [CardLocation.BOARD])
			.require(() => this.isAmbush)
			.require(({ card }) => card.type === CardType.SPELL)
			.require((_, { effectPrevented }) => effectPrevented === false)
			.require(({ owner }) => !owner.group.owns(this))
			.perform(() => {
				Keywords.revealCard(this)
			})
			.replace((values) => ({
				...values,
				effectPrevented: true,
			}))
	}
}
