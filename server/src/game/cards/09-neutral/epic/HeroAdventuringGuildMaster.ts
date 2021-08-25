import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffStrength from '../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'

export default class HeroAdventuringGuildMaster extends ServerCard {
	powerPerCard = asDirectBuffPotency(5)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 20,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			powerPerCard: this.powerPerCard,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const otherCardsPlayedThisRound = this.game.cardPlay.playedCards
			.filter((playerCard) => playerCard.turnIndex === this.game.turnIndex)
			.filter((playedCard) => this.ownerGroupInGame.includes(playedCard.player) && playedCard.roundIndex === this.game.roundIndex)
			.filter((playedCard) => playedCard.card !== this && playedCard.card.type === CardType.UNIT)
		this.buffs.addMultiple(BuffStrength, otherCardsPlayedThisRound.length * this.powerPerCard(this), this, BuffDuration.INFINITY)
	}
}
