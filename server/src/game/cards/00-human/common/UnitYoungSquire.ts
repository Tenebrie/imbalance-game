import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'
import ServerAnimation from '../../../models/ServerAnimation'

export default class UnitYoungSquire extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.PEASANT],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 6,
				soloUnitDamage: 2
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireAlliedUnit()
			.requireNotSelf()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.cardAffectsCards(this, [target.card]))
		this.game.board.moveUnitForward(target, 1)
	}
}
