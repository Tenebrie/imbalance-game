import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { getHighestUnit } from '@src/utils/Utils'

export default class GwentCrowsEye extends ServerCard {
	public static readonly BASE_DAMAGE = 4
	public static readonly BONUS_DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			tribes: [CardTribe.ALCHEMY, CardTribe.ORGANIC],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			baseDamage: GwentCrowsEye.BASE_DAMAGE,
			bonusDamage: GwentCrowsEye.BONUS_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: "Crow's Eye",
				description:
					'Deal {baseDamage} damage to the Highest enemy on each row.\nDeal {bonusDamage} extra damage for each copy of this card in your graveyard.',
				flavor:
					"A certain famous pirate once so loved this intoxicating herb, he earned the nickname 'Crow's Eye.' The theatrical version of his legend omits this, however, to the great consternation of pirate lore sticklers.",
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const copiesInGraveyard = owner.cardGraveyard.allCards.filter((card) => card.class === this.class).length
			const damage = GwentCrowsEye.BASE_DAMAGE + copiesInGraveyard * GwentCrowsEye.BONUS_DAMAGE
			const highestEnemies = game.board
				.getControlledRows(owner.opponent)
				.filter((row) => row.splashableCards.length > 0)
				.map((row) => getHighestUnit(row.cards)!)

			highestEnemies.forEach((unit) => {
				game.animation.thread(() => {
					unit.dealDamage(DamageInstance.fromCard(damage, this))
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
