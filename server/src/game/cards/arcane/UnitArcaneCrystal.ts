import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import ServerUnit from '../../models/ServerUnit'
import CardFaction from '@shared/enums/CardFaction'

export default class UnitArcaneCrystal extends ServerCard {
	charges = 0
	manaGenerated = 1
	chargePerMana = 1
	chargesForMana = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 4
		this.baseTribes = [CardTribe.BUILDING]
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated,
			chargePerMana: this.chargePerMana,
			chargesForMana: this.chargesForMana,
			charges: () => this.charges,
			potentialMana: () => Math.floor(this.charges / this.chargesForMana) * this.manaGenerated,
			chargesVisible: () => !!this.unit
		}
	}

	onAfterOtherCardPlayed(otherCard: ServerOwnedCard): void {
		if (otherCard.card.type === CardType.SPELL) {
			this.charges += otherCard.card.spellCost
		}
	}

	onBeforeDestroyedAsUnit(thisUnit: ServerUnit): void {
		thisUnit.owner.addSpellMana(Math.floor(this.charges / this.chargesForMana) * this.manaGenerated)
	}
}
