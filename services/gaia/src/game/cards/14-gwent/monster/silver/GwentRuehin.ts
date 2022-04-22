import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentRuehin extends ServerCard {
	public static readonly EXTRA_POWER = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.INSECTOID, CardTribe.CURSED],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			extraPower: GwentRuehin.EXTRA_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Ruehin',
				description: '*Strengthen* all your other Insectoids and Cursed units in hand, deck, and on board by {extraPower}.',
				flavor: 'No one has ever entered that forest and lived to tell the tale…',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const targets = game.board
				.getSplashableUnitsFor(this.ownerGroup)
				.map((unit) => unit.card)
				.concat(this.ownerPlayer.cardHand.allCards)
				.concat(this.ownerPlayer.cardDeck.allCards)
				.filter((card) => card.tribes.includes(CardTribe.INSECTOID) || card.tribes.includes(CardTribe.CURSED))
				.filter((card) => card !== this)

			targets.forEach((card) => {
				game.animation.thread(() => {
					card.buffs.addMultiple(BuffBaseStrength, GwentRuehin.EXTRA_POWER, this)
				})
			})
		})
	}
}
