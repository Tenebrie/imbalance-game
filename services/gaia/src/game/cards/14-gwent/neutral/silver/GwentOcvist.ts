import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentSingleUsed from '@src/game/buffs/14-gwent/BuffGwentSingleUsed'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentOcvist extends ServerCard {
	public static readonly TURNS_TO_WAIT = 4
	public static readonly DAMAGE = 1

	private turnsWaited = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.DRACONID],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ocvist`,
				description: `*Single-Use*: After *${GwentOcvist.TURNS_TO_WAIT}* turns, deal *${GwentOcvist.DAMAGE}* damage to all enemies, then return to your hand on turn start.`,
				flavor: `The Master of Quartz Mountain, the Destroyer, Trajan's Slayer. In his free time, he likes long walks and candlelight dinners.`,
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.require(() => !this.buffs.has(BuffGwentSingleUsed))
			.perform(() => {
				this.turnsWaited += 1
				if (this.turnsWaited !== GwentOcvist.TURNS_TO_WAIT) {
					return
				}

				this.buffs.add(BuffGwentSingleUsed, this)
				const allEnemies = game.board.getSplashableUnitsForOpponentOf(this)
				allEnemies.forEach((enemy) => enemy.dealDamage(DamageInstance.fromCard(GwentOcvist.DAMAGE, this), 'stagger'))

				const unit = this.unit
				if (unit) {
					Keywords.returnCardFromBoardToHand(unit)
				}
			})
	}
}
