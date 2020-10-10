import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardLibrary from '../../libraries/CardLibrary'
import UnitTinySparkling from './UnitTinySparkling'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitFlameTouchCrystal extends ServerCard {
	charges = 0
	chargePerMana = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: [CardTribe.CRYSTAL],
			faction: CardFaction.ARCANE,
			stats: {
				power: 4
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			chargePerMana: this.chargePerMana,
			charges: () => this.charges,
			chargesVisible: () => !!this.unit
		}

		this.createCallback(GameEventType.UNIT_DESTROYED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card === this)
			.perform(() => this.onDestroy())

		this.createCallback(GameEventType.CARD_PLAYED, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.perform(({ triggeringCard }) => this.onSpellPlayed(triggeringCard))
	}

	private onSpellPlayed(spell: ServerCard): void {
		this.charges += spell.stats.spellCost
	}

	private onDestroy(): void {
		const unit = this.unit!
		for (let i = 0; i < this.charges; i++) {
			const sparkling = CardLibrary.instantiateByConstructor(this.game, UnitTinySparkling)
			this.game.board.createUnit(sparkling, unit.owner, unit.rowIndex, unit.unitIndex)
		}
	}
}
