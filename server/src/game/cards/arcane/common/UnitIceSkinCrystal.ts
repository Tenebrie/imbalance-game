import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import BuffDecayingArmor from '../../../buffs/BuffDecayingArmor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import {CardPlayedEventArgs} from '../../../models/GameEventCreators'

export default class UnitIceSkinCrystal extends ServerCard {
	charges = 0
	armorGranted = 1
	chargePerMana = 1
	chargesForArmor = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN, CardFaction.ARCANE)
		this.basePower = 4
		this.baseTribes = [CardTribe.CRYSTAL]
		this.dynamicTextVariables = {
			armorGranted: this.armorGranted,
			chargePerMana: this.chargePerMana,
			chargesForArmor: this.chargesForArmor,
			charges: () => this.charges,
			potentialArmor: () => Math.floor(this.charges / this.chargesForArmor) * this.armorGranted,
			chargesVisible: () => !!this.unit
		}

		this.createCallback(GameEventType.UNIT_DESTROYED)
			.requireLocation(CardLocation.BOARD)
			.require(({ targetUnit }) => targetUnit.card === this)
			.perform(() => this.onDestroy())

		this.createCallback<CardPlayedEventArgs>(GameEventType.CARD_PLAYED)
			.requireLocation(CardLocation.BOARD)
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.perform(({ triggeringCard }) => this.onSpellPlayed(triggeringCard))
	}

	private onSpellPlayed(spell: ServerCard): void {
		this.charges += spell.spellCost
	}

	private onDestroy(): void {
		const thisUnit = this.unit
		const adjacentAllies = this.game.board.getAdjacentUnits(thisUnit).filter(unit => unit.owner === thisUnit.owner)
		adjacentAllies.forEach(unit => {
			for (let i = 0; i < Math.floor(this.charges / this.chargesForArmor) * this.armorGranted; i++) {
				unit.card.buffs.add(BuffDecayingArmor, this)
			}
		})
	}
}
