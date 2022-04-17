import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

export default class GwentShrike extends ServerCard {
	public static readonly DAMAGE = 2
	public static readonly TARGETS = 6

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentShrike.DAMAGE,
			targets: GwentShrike.TARGETS,
		}

		this.createLocalization({
			en: {
				name: 'Shrike',
				description: 'Deal {damage} damage to {targets} random enemies.',
				flavor:
					'While deadly for men, Potions are merely toxic for witchers. Yet even they must measure every drop, lest they exceed the maximum dosage... and pay the maximum price.',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const enemies = game.board.getUnitsOwnedByOpponent(this)
			const validEnemies = getMultipleRandomArrayValues(enemies, GwentShrike.TARGETS)
			validEnemies.forEach((unit) => {
				game.animation.thread(() => {
					unit.dealDamage(DamageInstance.fromCard(GwentShrike.DAMAGE, this))
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
