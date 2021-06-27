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
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asSplashBuffPotency } from '@src/utils/LeaderStats'
import { sortCards } from '@shared/Utils'

export default class UnitMasterSwordsmith extends ServerCard {
	bonusPower = asSplashBuffPotency(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.PEASANT],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const owner = this.ownerInGame
		const targets = sortCards(owner.cardHand.unitCards)
		targets.forEach((card) => {
			this.game.animation.createAnimationThread()
			card.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
			this.game.animation.commitAnimationThread()
		})
	}
}
