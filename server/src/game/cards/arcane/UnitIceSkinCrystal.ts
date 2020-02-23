import CardType from '../../shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '../../shared/enums/CardColor'
import CardTribe from '../../shared/enums/CardTribe'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import ServerCardOnBoard from '../../models/ServerCardOnBoard'
import BuffDecayingArmor from '../../buffs/BuffDecayingArmor'

export default class UnitIceSkinCrystal extends ServerCard {
	charges = 0
	armorGranted = 1
	chargePerMana = 1
	chargesForArmor = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 4
		this.cardTribes = [CardTribe.BUILDING]
		this.dynamicTextVariables = {
			armorGranted: this.armorGranted,
			chargePerMana: this.chargePerMana,
			chargesForArmor: this.chargesForArmor,
			charges: () => this.charges,
			potentialArmor: () => Math.floor(this.charges / this.chargesForArmor) * this.armorGranted,
			chargesVisible: () => !!this.unit
		}
	}

	onAfterOtherCardPlayed(otherCard: ServerOwnedCard): void {
		if (otherCard.card.cardType === CardType.SPELL) {
			this.charges += otherCard.card.spellCost
		}
	}

	onBeforeDestroyedAsUnit(thisUnit: ServerCardOnBoard): void {
		const adjacentAllies = this.game.board.getAdjacentUnits(thisUnit).filter(unit => unit.owner === thisUnit.owner)
		adjacentAllies.forEach(unit => {
			for (let i = 0; i < Math.floor(this.charges / this.chargesForArmor) * this.armorGranted; i++) {
				unit.card.cardBuffs.add(new BuffDecayingArmor(), this)
			}
		})
	}
}
