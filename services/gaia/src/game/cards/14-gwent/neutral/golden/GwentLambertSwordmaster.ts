import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentLambertSwordmaster extends ServerCard {
	public static readonly DAMAGE = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.WITCHER],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Lambert: Swordmaster`,
				description: `Deal *${GwentLambertSwordmaster.DAMAGE}* damage to all copies of an enemy unit.`,
				flavor: `Go teach your grandma to suck eggs.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const targetClass = targetUnit.card.class
				const owner = targetUnit.originalOwner
				const allTargets = owner.cardHand.allCards
					.concat(owner.cardDeck.allCards)
					.concat(owner.cardGraveyard.allCards)
					.concat(game.board.getSplashableUnitsFor(owner).map((unit) => unit.card))
					.filter((card) => card.class === targetClass)

				allTargets.forEach((target) => {
					target.dealDamage(DamageInstance.fromCard(GwentLambertSwordmaster.DAMAGE, this), 'stagger')
				})
			})
	}
}
