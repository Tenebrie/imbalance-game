import BuffAlignment from '@shared/enums/BuffAlignment'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getConstructorFromBuff } from '@src/utils/Utils'

export default class GwentClearSkies extends ServerCard {
	public static readonly BOOST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.TACTIC, CardTribe.TOKEN, CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			boost: GwentClearSkies.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Clear Skies',
				description: 'Boost all damaged allies under *Hazards* by {boost} and clear all *Hazards* from your side.',
				flavor: 'Ah, the sun. Enjoy it while you still can, Dromle!',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const alliesToBoost = game.board
				.getSplashableUnitsFor(owner.group)
				.filter((unit) => unit.boardRow.buffs.buffs.some((buff) => buff.alignment === BuffAlignment.NEGATIVE))

			alliesToBoost.forEach((ally) => {
				game.animation.thread(() => {
					ally.buffs.addMultiple(BuffStrength, GwentClearSkies.BOOST, this)
				})
			})

			const rowsToCleanse = game.board
				.getControlledRows(owner.group)
				.filter((row) => row.buffs.buffs.some((buff) => buff.alignment === BuffAlignment.NEGATIVE))

			rowsToCleanse.forEach((row) => {
				game.animation.thread(() => {
					row.buffs.removeAll(getConstructorFromBuff(row.buffs.buffs.find((buff) => buff.alignment === BuffAlignment.NEGATIVE)!), this)
				})
			})

			game.animation.syncAnimationThreads()
		})
	}
}
