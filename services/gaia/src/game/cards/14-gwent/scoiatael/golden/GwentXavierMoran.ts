import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BotCardEvaluation from '@src/game/AI/BotCardEvaluation'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentXavierMoran extends ServerCard {
	public lastPlayedDwarf?: ServerCard

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.DWARF],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createPlayTargets().evaluate(({ targetRow }) => (targetRow.hasBoon ? 1 : 0))

		this.createLocalization({
			en: {
				name: 'Xavier Moran',
				description: 'Boost this unit by the default power of the last other Dwarf you played.',
				flavor: "Well? Somethin' wrong? Venison a wee bit rank for ye? Ehh, princess?",
			},
		})

		this.createCallback(GameEventType.CARD_PLAYED, 'any')
			.require(({ owner }) => owner.group.owns(this))
			.require(({ triggeringCard }) => triggeringCard.tribes.includes(CardTribe.DWARF))
			.perform(({ triggeringCard }) => {
				this.lastPlayedDwarf = triggeringCard
			})

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => !!this.lastPlayedDwarf)
			.perform(() => {
				this.buffs.addMultiple(BuffBaseStrength, this.lastPlayedDwarf!.stats.basePower, this)
			})

		this.botEvaluation = new CustomBotEvaluation(this)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		const lastDwarfPower = (this.card as GwentXavierMoran).lastPlayedDwarf?.stats.power || 0
		return this.card.stats.power + lastDwarfPower
	}
}
