import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import ServerUnit from '../../models/ServerUnit'
import CardLibrary from '../../libraries/CardLibrary'
import UnitTinySparkling from './UnitTinySparkling'
import CardFaction from '@shared/enums/CardFaction'

export default class UnitFlameTouchCrystal extends ServerCard {
	charges = 0
	chargePerMana = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 4
		this.baseTribes = [CardTribe.BUILDING]
		this.dynamicTextVariables = {
			chargePerMana: this.chargePerMana,
			charges: () => this.charges,
			chargesVisible: () => !!this.unit
		}
	}

	onAfterOtherCardPlayed(otherCard: ServerOwnedCard): void {
		if (otherCard.card.type === CardType.SPELL) {
			this.charges += otherCard.card.spellCost
		}
	}

	onBeforeDestroyedAsUnit(thisUnit: ServerUnit): void {
		for (let i = 0; i < this.charges; i++) {
			const sparkling = CardLibrary.instantiate(new UnitTinySparkling(this.game))
			this.game.board.createUnit(sparkling, thisUnit.owner, thisUnit.rowIndex, thisUnit.unitIndex)
		}
	}
}
