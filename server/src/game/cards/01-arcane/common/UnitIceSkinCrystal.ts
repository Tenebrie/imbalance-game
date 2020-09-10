import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import BuffDecayingArmor from '../../../buffs/BuffDecayingArmor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import {CardPlayedEventArgs, UnitDestroyedEventArgs} from '../../../models/GameEventCreators'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitIceSkinCrystal extends ServerCard {
	charges = 0
	armorGranted = 1
	chargePerMana = 1
	chargesForArmor = 3

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
			armorGranted: this.armorGranted,
			chargePerMana: this.chargePerMana,
			chargesForArmor: this.chargesForArmor,
			charges: () => this.charges,
			potentialArmor: () => Math.floor(this.charges / this.chargesForArmor) * this.armorGranted,
			chargesVisible: () => !!this.unit
		}

		this.createCallback<UnitDestroyedEventArgs>(GameEventType.UNIT_DESTROYED, [CardLocation.BOARD])
			.require(({ triggeringUnit }) => triggeringUnit.card === this)
			.perform(() => this.onDestroy())

		this.createCallback<CardPlayedEventArgs>(GameEventType.CARD_PLAYED, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.perform(({ triggeringCard }) => this.onSpellPlayed(triggeringCard))
	}

	private onSpellPlayed(spell: ServerCard): void {
		this.charges += spell.stats.spellCost
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
