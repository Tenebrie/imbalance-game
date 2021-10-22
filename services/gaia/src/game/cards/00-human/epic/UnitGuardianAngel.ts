import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import BuffProtector from '@src/game/buffs/BuffProtector'
import Keywords from '@src/utils/Keywords'

import GameHookType from '../../../models/events/GameHookType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitGuardianAngel extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			features: [CardFeature.PROMINENT],
			stats: {
				power: 12,
				armor: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.buffs.add(BuffProtector, this)

		this.createLocalization({
			en: {
				name: 'Guardian Angel',
				description: 'Before an ally takes lethal damage while this is in your hand, *Return* it to your hand and *Summon* this instead.',
			},
		})

		this.createHook(GameHookType.UNIT_DESTROYED, [CardLocation.HAND])
			.require(({ reason }) => reason === UnitDestructionReason.CARD_EFFECT)
			.require(({ targetUnit }) => !!targetUnit && targetUnit.card.location === CardLocation.BOARD)
			.require(({ targetUnit }) => targetUnit.owner === this.ownerGroup)
			.replace((values) => ({
				...values,
				destructionPrevented: true,
			}))
			.perform(({ targetUnit }) => {
				const targetRowIndex = targetUnit.rowIndex
				const targetUnitIndex = targetUnit.unitIndex
				Keywords.returnCardFromBoardToHand(targetUnit)

				Keywords.summonUnitFromHand({
					card: this,
					owner: this.ownerPlayer,
					rowIndex: targetRowIndex,
					unitIndex: targetUnitIndex,
				})
			})
	}
}
