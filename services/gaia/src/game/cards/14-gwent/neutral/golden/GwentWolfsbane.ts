import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { getHighestUnit, getLowestUnit } from '@src/utils/Utils'

export default class GwentWolfsbane extends ServerCard {
	public static readonly TURNS_TO_WAIT = 3
	public static readonly DAMAGE = 6
	public static readonly BOOST = 6

	private turnsPassed = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Wolfsbane`,
				description: `After *${GwentWolfsbane.TURNS_TO_WAIT}* turns in the graveyard, deal *${GwentWolfsbane.DAMAGE}* damage to the *Highest* enemy and boost the *Lowest* ally by *${GwentWolfsbane.BOOST}* on turn end.`,
				flavor: `Also known as 'the queen of poisons,' wolfsbane is used in many witcher Potions and alchemic brews.`,
			},
		})

		this.createEffect(GameEventType.CARD_DISCARDED).perform(() => (this.turnsPassed = 0))
		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(() => (this.turnsPassed = 0))

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.GRAVEYARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				this.turnsPassed += 1
				if (this.turnsPassed !== GwentWolfsbane.TURNS_TO_WAIT) {
					return
				}

				const allies = game.board.getSplashableUnitsFor(this)
				const enemies = game.board.getSplashableUnitsForOpponentOf(this)

				const lowestAlly = getLowestUnit(allies)
				const highestEnemy = getHighestUnit(enemies)
				if (lowestAlly) {
					lowestAlly.boost(GwentWolfsbane.BOOST, this, 'parallel')
				}
				if (highestEnemy) {
					highestEnemy.dealDamage(DamageInstance.fromCard(GwentWolfsbane.DAMAGE, this), 'parallel')
				}
			})
	}
}
