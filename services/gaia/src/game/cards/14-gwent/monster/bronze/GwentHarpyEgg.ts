import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { shuffle } from '@shared/Utils'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import BuffGwentExtraConsumePower from '@src/game/buffs/14-gwent/BuffGwentExtraConsumePower'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentHarpyHatchling from '../tokens/GwentHarpyHatchling'

export default class GwentHarpyEgg extends ServerCard {
	public static readonly EXTRA_CONSUMED_POWER = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			features: [CardFeature.DOOMED, CardFeature.HAS_DEATHWISH],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			extraPower: GwentHarpyEgg.EXTRA_CONSUMED_POWER,
		}

		this.buffs.addMultiple(BuffGwentExtraConsumePower, GwentHarpyEgg.EXTRA_CONSUMED_POWER, this)

		this.createLocalization({
			en: {
				name: 'Harpy Egg',
				description: 'When *Consumed*, boost *Consuming* unit by {extraPower}.<p>*Deathwish:* *Spawn* a *Harpy Hatchling* on a random row.',
				flavor:
					"A harpy egg omelet - a delicious delicacy, good sir. Quite dear, too, for as you might surmise, the wretches don't part with their eggs willingly.",
			},
		})

		this.createEffect(GameEventType.AFTER_UNIT_DESTROYED)
			.require(({ reason }) => reason === UnitDestructionReason.CARD_EFFECT)
			.perform(() => {
				const targetRow = shuffle(game.board.getControlledRows(this.ownerGroup))[0]
				Keywords.summonUnit({
					owner: this.ownerPlayer,
					cardConstructor: GwentHarpyHatchling,
					rowIndex: targetRow.index,
					unitIndex: targetRow.cards.length,
				})
			})
	}
}
