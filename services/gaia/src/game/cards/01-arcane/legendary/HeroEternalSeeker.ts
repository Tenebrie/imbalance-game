import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import UnitEternalDeceit from '@src/game/cards/01-arcane/epic/UnitEternalDeceit'
import UnitEternalTruth from '@src/game/cards/01-arcane/epic/UnitEternalTruth'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroEternalSeeker extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 5,
			},
			relatedCards: [UnitEternalTruth, UnitEternalDeceit],
			deckAddedCards: [UnitEternalTruth, UnitEternalDeceit],
			expansionSet: ExpansionSet.BASE,
		})
		this.createLocalization({
			en: {
				name: 'Ventrilla',
				title: 'The Eternal Seeker',
				description:
					'*Game start:*<br>Add an *Eternal Truth* and an *Eternal Deceit* to your deck.<p>*Deploy:*<br>*Play* either one from your deck.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.require(({ targetCard }) => targetCard instanceof UnitEternalTruth || targetCard instanceof UnitEternalDeceit)
			.require(({ targetCard }) => targetCard.ownerPlayerNullable === this.ownerPlayer)
			.perform(({ targetCard }) => Keywords.playCardFromDeck(targetCard))
	}
}
