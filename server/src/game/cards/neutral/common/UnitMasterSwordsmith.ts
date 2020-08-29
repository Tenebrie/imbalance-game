import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import Utils from '../../../../utils/Utils'

export default class UnitMasterSwordsmith extends ServerCard {
	bonusPower = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 2
		this.baseTribes = [CardTribe.HUMAN]
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower
		}
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const unit = this.unit
		const owner = unit.owner
		const targets = Utils.sortCards(owner.cardHand.unitCards)
		targets.forEach(card => {
			this.game.animation.createStaggeredAnimationThread()
			card.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
			this.game.animation.commitAnimationThread()
		})
		this.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
	}
}
