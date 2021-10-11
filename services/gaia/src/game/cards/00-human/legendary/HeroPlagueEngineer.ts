import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import SpellBloodPlague from '@src/game/cards/00-human/spells/SpellBloodPlague'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroPlagueEngineer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.NIGHTWATCH],
			stats: {
				power: 6,
			},
			relatedCards: [SpellBloodPlague],
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Fex',
				title: 'The Plague Engineer',
				description:
					"*Deploy* and *Round start:*<br>Add *Blood Plague* to your opponent's hand.<p>*Round start:*\nRepeat the *Deploy* effect.",
			},
		})

		const performEffect = () => {
			this.ownerPlayer.opponent.players.forEach((player) => {
				Keywords.addCardToHand.for(player).fromConstructor(SpellBloodPlague, {
					reveal: true,
				})
			})
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(performEffect)
		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.BOARD])
			.require(({ group }) => group === this.ownerGroup)
			.perform(performEffect)
	}
}
