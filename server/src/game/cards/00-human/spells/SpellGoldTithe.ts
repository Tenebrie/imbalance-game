import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectBuffPotency } from '@src/utils/LeaderStats'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation } from '@src/utils/Utils'

export default class SpellGoldTithe extends ServerCard {
	public static readonly BONUS_POWER = asDirectBuffPotency(3)

	private canBePlayed = true

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: SpellGoldTithe.BONUS_POWER,
		}

		this.createPlayTargets().require(() => this.canBePlayed)

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.perform(({ targetCard }) => targetCard.buffs.addMultiple(BuffStrength, SpellGoldTithe.BONUS_POWER, this))

		this.createCallback(GameEventType.CARD_PLAYED, AnyCardLocation)
			.require(({ triggeringCard }) => triggeringCard !== this)
			.require(({ triggeringCard }) => triggeringCard instanceof SpellGoldTithe)
			.perform(() => (this.canBePlayed = false))

		this.createCallback(GameEventType.TURN_STARTED, AnyCardLocation)
			.require(({ player }) => player === this.owner)
			.perform(() => (this.canBePlayed = true))
	}
}
