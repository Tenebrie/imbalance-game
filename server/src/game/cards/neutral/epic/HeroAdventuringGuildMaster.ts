import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEvent from '../../../models/GameEvent'

export default class HeroAdventuringGuildMaster extends ServerCard {
	powerPerCard = 5

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.NEUTRAL)
		this.basePower = 10
		this.dynamicTextVariables = {
			powerPerCard: this.powerPerCard
		}

		this.subscribe(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const otherCardsPlayed = this.owner.cardsPlayed.filter(card => card !== this && card.type === CardType.UNIT)
		for (let i = 0; i < otherCardsPlayed.length * this.powerPerCard; i++) {
			this.buffs.add(BuffStrength, this, BuffDuration.INFINITY)
		}
	}
}
