import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentKingOfBeggars extends ServerCard {
	public static readonly MAX_EXTRA_POWER = 15

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SUPPORT],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `King of Beggars`,
				description: `If losing, *Strengthen* self up to a maximum of *${GwentKingOfBeggars.MAX_EXTRA_POWER}* until scores are tied.`,
				flavor: `I might just discover I look great without ears… or hands. Apparently the King of Beggars accepts both as partial payment.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const ownerScore = game.board.getTotalPlayerPower(owner.group)
			const opponentScore = game.board.getTotalPlayerPower(owner.opponent)
			const difference = opponentScore - ownerScore
			if (difference <= 0) {
				return
			}

			const powerToGet = Math.min(difference, GwentKingOfBeggars.MAX_EXTRA_POWER)
			this.strengthen(powerToGet, this)
		})
	}
}
