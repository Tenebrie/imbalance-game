import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import UnitFierceShadow from '@src/game/cards/01-arcane/tokens/UnitFierceShadow'
import Keywords from '@src/utils/Keywords'
import { asDirectSummonCount } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class SpellScrollOfSummoning extends ServerCard {
	public static readonly BASE_SHADOWS_SUMMONED = 3
	private shadowsSummoned = asDirectSummonCount(SpellScrollOfSummoning.BASE_SHADOWS_SUMMONED)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SCROLL],
			stats: {
				cost: 3,
			},
			relatedCards: [UnitFierceShadow],
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			shadowsSummoned: this.shadowsSummoned,
		}

		this.createLocalization({
			en: {
				name: 'Scroll of Summoning',
				description: '*Summon* {shadowsSummoned} *Fierce Shadows* on a target row.',
			},
		})

		this.createPlayTargets().require(() => game.board.getControlledRows(this.ownerGroup).some((row) => !row.isFull()))

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.requireAllied()
			.require(({ targetRow }) => !targetRow.isFull())
			.perform(({ targetRow, targetPosition }) => {
				for (let i = 0; i < this.shadowsSummoned(this); i++) {
					game.animation.thread(() =>
						Keywords.summonUnit({
							owner: this.ownerPlayer,
							cardConstructor: UnitFierceShadow,
							rowIndex: targetRow.index,
							unitIndex: targetPosition,
						})
					)
				}
				game.animation.syncAnimationThreads()
			})
	}
}
