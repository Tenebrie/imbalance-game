import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import Keywords from '../../../../utils/Keywords'
import ServerAnimation from '../../../models/ServerAnimation'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import UnitVoidPortal from '../tokens/UnitVoidPortal'

export default class UnitDarkTimewarper extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitVoidPortal],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const targets = this.game.board
			.getAllUnits()
			.map((unit) => unit.card)
			.filter((card) => card instanceof UnitVoidPortal) as UnitVoidPortal[]

		targets.forEach((target) => {
			this.game.animation.createAnimationThread()
			this.game.animation.play(ServerAnimation.cardAffectsCards(this, [target]))
			target.onTurnEnded()
			this.game.animation.commitAnimationThread()
		})

		Keywords.createCard.forOwnerOf(this).fromConstructor(UnitVoidPortal)
	}
}
