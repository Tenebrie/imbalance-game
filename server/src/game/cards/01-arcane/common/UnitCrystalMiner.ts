import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitCrystalMiner extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE],
			stats: {
				power: 2
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})

		this.createDeployEffectTargets()
			.target(TargetType.CARD_IN_LIBRARY)
			.require(TargetType.CARD_IN_LIBRARY, args => args.targetCard.tribes.includes(CardTribe.CRYSTAL))

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		this.owner.createCardFromLibraryByInstance(target)
	}
}
