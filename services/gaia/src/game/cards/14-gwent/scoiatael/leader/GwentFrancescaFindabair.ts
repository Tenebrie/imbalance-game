import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentFrancescaFindabair extends ServerCard {
	private deployEffectStage: 'return' | 'draw' = 'return'
	public static readonly BOOST = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.MAGE, CardTribe.ELF],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLeaderLocalization({
			en: {
				name: `Francesca Findabair`,
				description: `*Swap* a card with one of your choice and boost it by *${GwentFrancescaFindabair.BOOST}*.`,
				flavor: `To live in peace, we first must kill. This is human oppression's cruel finale.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.requireAllied()
			.totalTargetCount(2)
			.require(() => this.deployEffectStage === 'return')
			.perform(({ targetCard }) => {
				Keywords.returnCardFromHandToDeck(targetCard)
				this.deployEffectStage = 'draw'
			})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.totalTargetCount(2)
			.require(() => this.deployEffectStage === 'draw')
			.perform(({ targetCard, player }) => {
				Keywords.drawExactCard(player, targetCard)

				if (targetCard.type === CardType.UNIT) {
					targetCard.boostBy(GwentFrancescaFindabair.BOOST, this)
				}
			})
	}
}
