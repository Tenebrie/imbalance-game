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
import ExpansionSet from '@shared/enums/ExpansionSet'
import {asMassBuffPotency} from '../../../../utils/LeaderStats'

export default class UnitMasterSwordsmith extends ServerCard {
	bonusPower = asMassBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const owner = this.ownerInGame
		const targets = Utils.sortCards(owner.cardHand.unitCards)
		targets.forEach(card => {
			this.game.animation.createAnimationThread()
			card.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
			this.game.animation.commitAnimationThread()
		})
	}
}
