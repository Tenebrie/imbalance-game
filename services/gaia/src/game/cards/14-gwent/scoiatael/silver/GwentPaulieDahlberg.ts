import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentPaulieDahlberg extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SUPPORT, CardTribe.DWARF, CardTribe.DOOMED],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createPlayTargets().evaluate(({ targetRow }) => (targetRow.hasBoon ? 1 : 0))

		this.createLocalization({
			en: {
				name: 'Paulie Dahlberg',
				description: '*Resurrect* a non-Support Bronze Dwarf.',
				flavor: "Move yer arses! It's a ploughin' trap!",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.requireAllied()
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE && targetCard.tribes.includes(CardTribe.DWARF))
			.perform(({ targetCard, player }) => {
				Keywords.playCardFromGraveyard(targetCard, player)
			})

		this.createBotEvaluation().evaluateScore(() => {
			const bestDwarf = this.ownerPlayer.cardGraveyard.allCards
				.filter((card) => card.tribes.includes(CardTribe.DWARF) && !card.tribes.includes(CardTribe.SUPPORT))
				.filter((card) => card.color === CardColor.BRONZE)
				.map((card) => card.botMetadata.evaluateExpectedScore())
				.sort((a, b) => b - a)
			return bestDwarf[0] || 0
		})
	}
}
