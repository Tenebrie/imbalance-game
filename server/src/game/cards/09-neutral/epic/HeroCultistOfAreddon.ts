import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../../models/ServerUnit'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ServerAnimation from '../../../models/ServerAnimation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardTribe from '@shared/enums/CardTribe'
import Keywords from '../../../../utils/Keywords'

export default class HeroCultistOfAreddon extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			tribes: CardTribe.CULTIST,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.require(({ targetCard }) => !targetCard.tribes.includes(CardTribe.CULTIST))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		const cardClass = target.card.class
		this.game.animation.play(ServerAnimation.cardAffectsCards(this, [target.card]))
		this.game.board.destroyUnit(target)
		Keywords.createCard.forOwnerOf(this).fromClass(cardClass)
	}
}
