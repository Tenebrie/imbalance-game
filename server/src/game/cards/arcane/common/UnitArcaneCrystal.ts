import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent from '../../../models/GameEvent'
import CardLocation from '@shared/enums/CardLocation'

export default class UnitArcaneCrystal extends ServerCard {
	charges = 0
	manaGenerated = 1
	chargePerMana = 1
	chargesForMana = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN, CardFaction.ARCANE)
		this.basePower = 4
		this.baseTribes = [CardTribe.CRYSTAL]
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated,
			chargePerMana: this.chargePerMana,
			chargesForMana: this.chargesForMana,
			charges: () => this.charges,
			potentialMana: () => Math.floor(this.charges / this.chargesForMana) * this.manaGenerated,
			chargesVisible: () => !!this.unit
		}

		this.createCallback(GameEvent.UNIT_DESTROYED)
			.requireLocation(CardLocation.BOARD)
			.require(({ targetUnit }) => targetUnit.card === this)
			.perform(() => this.onDestroy())
	}

	onAfterOtherCardPlayed(otherCard: ServerOwnedCard): void {
		if (otherCard.card.type === CardType.SPELL) {
			this.charges += otherCard.card.spellCost
		}
	}

	private onDestroy(): void {
		this.unit.owner.addSpellMana(Math.floor(this.charges / this.chargesForMana) * this.manaGenerated)
	}
}
