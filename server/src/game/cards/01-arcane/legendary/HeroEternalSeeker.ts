import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import UnitEternalTruth from '@src/game/cards/01-arcane/epic/UnitEternalTruth'
import UnitEternalDeceit from '@src/game/cards/01-arcane/epic/UnitEternalDeceit'
import Keywords from '@src/utils/Keywords'
import TargetType from '@shared/enums/TargetType'

export default class HeroEternalSeeker extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
			relatedCards: [UnitEternalTruth, UnitEternalDeceit],
			deckAddedCards: [UnitEternalTruth, UnitEternalDeceit],
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
			.require(({ targetCard }) => targetCard.ownerPlayer === this.ownerPlayerInGame)
			.perform(({ targetCard }) => Keywords.summonCard(targetCard))
	}
}
