import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'

export default class HeroAdventuringGuildMaster extends ServerCard {
	powerPerCard = 5

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.NEUTRAL)
		this.basePower = 10
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]
		this.dynamicTextVariables = {
			powerPerCard: this.powerPerCard
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const otherCardsPlayed = this.owner.cardsPlayed.filter(card => card !== this && card.type === CardType.UNIT)
		this.buffs.addMultiple(BuffStrength, otherCardsPlayed.length * this.powerPerCard, this, BuffDuration.INFINITY)
	}
}
