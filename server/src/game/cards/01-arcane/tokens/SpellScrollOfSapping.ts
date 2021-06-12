import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import ServerAnimation from '../../../models/ServerAnimation'
import GameEventType from '@shared/enums/GameEventType'
import CardTribe from '@shared/enums/CardTribe'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '@src/utils/Keywords'
import BuffSappedCard from '@src/game/buffs/BuffSappedCard'
import BuffDuration from '@src/../../shared/src/enums/BuffDuration'

export default class SpellScrollOfSapping extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SCROLL],
			features: [CardFeature.KEYWORD_BUFF_TEMPORARY_CARD],
			stats: {
				cost: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.UNIT)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.universeAffectsCards([target.card]))
		Keywords.returnCard(target.card)
		target.card.buffs.add(BuffSappedCard, this, BuffDuration.END_OF_NEXT_TURN)
	}
}
