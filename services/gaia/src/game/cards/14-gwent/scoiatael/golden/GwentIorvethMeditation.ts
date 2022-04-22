import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import ServerUnit from '@src/game/models/ServerUnit'

export default class GwentIorvethMeditation extends ServerCard {
	private deployEffectStage: 'firstTarget' | 'secondTarget' = 'firstTarget'

	private firstTarget?: ServerUnit

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.OFFICER],
			stats: {
				power: 2,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Iorveth: Meditation`,
				description: `Force two enemies on the same row to *Duel* each other.`,
				flavor: `Iorveth may have only one eye, but his inner vision is unmatched.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(({ targetUnit }) => targetUnit.boardRow.cards.length > 1)
			.totalTargetCount(2)
			.require(() => this.deployEffectStage === 'firstTarget')
			.perform(({ targetUnit }) => {
				this.firstTarget = targetUnit
				this.deployEffectStage = 'secondTarget'
			})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(({ targetUnit }) => targetUnit !== this.firstTarget)
			.require(({ targetUnit }) => targetUnit.rowIndex === this.firstTarget?.rowIndex)
			.totalTargetCount(2)
			.require(() => this.deployEffectStage === 'secondTarget')
			.perform(({ targetCard }) => {
				for (let i = 0; i < 100; i++) {
					targetCard.dealDamage(DamageInstance.fromUnit(this.firstTarget!.stats.power, this.firstTarget!))
					if (targetCard.stats.power <= 0) {
						break
					}

					this.firstTarget!.dealDamage(DamageInstance.fromCard(targetCard.stats.power, targetCard))
					if (this.firstTarget!.stats.power <= 0) {
						break
					}
				}
			})
	}
}
