import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentRowRaghNarRoog from '@src/game/buffs/14-gwent/BuffGwentRowRaghNarRoog'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentRaghNarRoog extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.SPELL, CardTribe.HAZARD],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Ragh Nar Roog`,
				description: `Apply a *Hazard* to each enemy row that deals *${BuffGwentRowRaghNarRoog.DAMAGE}* damage to the *Highest* unit on turn start.`,
				flavor: `In the Final Age, Hemdall will come forth to face the evil issuing from the land of Morhogg - the legions of wraiths, demons and specters of Chaos.`,
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const allEnemyRows = game.board.getControlledRows(owner.opponent)
			allEnemyRows.forEach((row) => {
				game.animation.thread(() => {
					row.buffs.add(BuffGwentRowRaghNarRoog, this)
				})
			})
		})
	}
}
