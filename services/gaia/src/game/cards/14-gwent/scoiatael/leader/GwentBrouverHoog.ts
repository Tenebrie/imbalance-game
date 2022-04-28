import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentBrouverHoog extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DWARF],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLeaderLocalization({
			en: {
				name: 'Brouver Hoog',
				description: 'Play a non-Spying Silver unit or a Bronze Dwarf from your deck.',
				flavor: "Our mead smells rotten to ye, do it? Easy to fix - I'll break yer nose!",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.type === CardType.UNIT)
			.require(
				({ targetCard }) =>
					(targetCard.color === CardColor.BRONZE && targetCard.tribes.includes(CardTribe.DWARF)) ||
					(targetCard.color === CardColor.SILVER && !targetCard.features.includes(CardFeature.SPY))
			)
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
			})
			.evaluate(({ targetCard }) => targetCard.botMetadata.evaluateBotScore())

		this.createBotEvaluation().evaluateScore(() => 105)
	}
}
