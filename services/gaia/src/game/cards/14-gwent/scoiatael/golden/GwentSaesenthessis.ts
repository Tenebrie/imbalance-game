import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentSaesenthessis extends ServerCard {
	public static readonly BOOST = 1
	public static readonly DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.AEDIRN, CardTribe.DRACONID],
			stats: {
				power: 10,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Saesenthessis`,
				description: `Boost self by *${GwentSaesenthessis.BOOST}* for each Dwarf ally and deal *${GwentSaesenthessis.DAMAGE}* damage to an enemy for each Elf ally.`,
				flavor: `I inherited my father's ability to assume other forms - well, one other form, in my case.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			const dwarfCount = game.board.getSplashableUnitsOfTribe(CardTribe.DWARF, this.ownerGroup).length
			this.boost(dwarfCount * GwentSaesenthessis.BOOST, this)
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(() => game.board.getSplashableUnitsOfTribe(CardTribe.ELF, this.ownerGroup).length > 0)
			.perform(({ targetUnit }) => {
				const elfCount = game.board.getSplashableUnitsOfTribe(CardTribe.ELF, this.ownerGroup).length
				targetUnit.dealDamage(DamageInstance.fromCard(elfCount * GwentSaesenthessis.DAMAGE, this))
			})
	}
}
