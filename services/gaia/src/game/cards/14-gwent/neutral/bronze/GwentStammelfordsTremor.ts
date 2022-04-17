import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentStammelfordsTremor extends ServerCard {
	public static readonly DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SPELL],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentStammelfordsTremor.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: "Stammelford's Tremor",
				description: 'Deal {damage} damage to all enemies.',
				flavor:
					"The sorcerer Stammelford moved a mountain that obscured the view from his tower. Rumor has it he could only do so for he'd fettered a d'ao, an earth elemental.",
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const enemies = game.board.getUnitsOwnedByOpponent(this)
			enemies.forEach((unit) => {
				game.animation.thread(() => {
					unit.dealDamage(DamageInstance.fromCard(GwentStammelfordsTremor.DAMAGE, this))
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
