import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentSingleUsed from '@src/game/buffs/14-gwent/BuffGwentSingleUsed'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentOperator extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Operator`,
				description: `*Single-Use*, *Truce*: Make a default copy of a Bronze unit in your hand for both players.`,
				flavor: `As time and space collapse before us, they expand behind us. In that way one moves forward through both.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_HAND)
			.require(() => !this.buffs.has(BuffGwentSingleUsed))
			.requireAllied()
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.perform(({ targetCard }) => {
				this.buffs.add(BuffGwentSingleUsed, this)
				game.allPlayers.forEach((player) => {
					game.animation.instantThread(() => {
						Keywords.addCardToHand.for(player).fromInstance(targetCard)
					})
				})
			})
	}
}
