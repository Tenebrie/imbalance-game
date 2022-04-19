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

export default class GwentBekkersRockslide extends ServerCard {
	public static readonly DAMAGE = 2
	public static readonly TARGETS = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SPELL],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentBekkersRockslide.DAMAGE,
			targets: GwentBekkersRockslide.TARGETS,
		}

		this.createLocalization({
			en: {
				name: `Bekker's Rockslide`,
				description: 'Deal {damage} damage to {targets} random enemies.',
				flavor: `All it takes is one pebble and we're all done for.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => {
			const enemies = game.board.getUnitsOwnedByOpponent(this)
			const validEnemies = getMultipleRandomArrayValues(enemies, GwentBekkersRockslide.TARGETS)
			validEnemies.forEach((unit) => {
				game.animation.thread(() => {
					unit.dealDamage(DamageInstance.fromCard(GwentBekkersRockslide.DAMAGE, this))
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
