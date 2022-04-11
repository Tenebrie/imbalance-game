import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { shuffle } from '@shared/Utils'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentArchespore extends ServerCard {
	public static readonly MOVE_DAMAGE = 1
	public static readonly DEATH_DAMAGE = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CURSED],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			moveDamage: GwentArchespore.MOVE_DAMAGE,
			deathDamage: GwentArchespore.DEATH_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Archespore',
				description:
					'Move to a random row and deal {moveDamage} damage to a random enemy on turn start.<p>*Deathwish:* Deal {deathDamage} damage to a random enemy.',
				flavor:
					'Folklore claims they sprout from soil watered with the blood of the dying. Thus they flourish in grounds consecrated by pogroms, dark rituals or brutal murders.',
			},
		})

		const dealDamageToRandomEnemy = (damage: number) => {
			const enemyUnits = game.board.getUnitsOwnedByOpponent(this)
			if (enemyUnits.length === 0) {
				return
			}
			const targetUnit = shuffle(enemyUnits)[0]
			targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
		}

		this.createCallback(GameEventType.TURN_STARTED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(({ group }) => {
				const unit = this.unit!
				const validRows = game.board
					.getControlledRows(group)
					.filter((row) => row.index !== unit.rowIndex)
					.filter((row) => !row.isFull())
				if (validRows.length === 0) {
					return
				}
				const targetRow = shuffle(validRows)[0]
				Keywords.moveUnit(unit, targetRow, targetRow.farRightUnitIndex)
				dealDamageToRandomEnemy(GwentArchespore.MOVE_DAMAGE)
			})

		this.createEffect(GameEventType.UNIT_DESTROYED)
			.require(({ reason }) => reason === UnitDestructionReason.CARD_EFFECT)
			.perform(() => {
				dealDamageToRandomEnemy(GwentArchespore.DEATH_DAMAGE)
			})
	}
}
