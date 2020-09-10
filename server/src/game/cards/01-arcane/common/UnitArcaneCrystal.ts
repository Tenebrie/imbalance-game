import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import {CardPlayedEventArgs, UnitDestroyedEventArgs} from '../../../models/GameEventCreators'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitArcaneCrystal extends ServerCard {
	charges = 0
	manaGenerated = 1
	chargePerMana = 1
	chargesForMana = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.CRYSTAL],
			stats: {
				power: 4
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated,
			chargePerMana: this.chargePerMana,
			chargesForMana: this.chargesForMana,
			charges: () => this.charges,
			potentialMana: () => Math.floor(this.charges / this.chargesForMana) * this.manaGenerated,
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
		this.unit.owner.addSpellMana(Math.floor(this.charges / this.chargesForMana) * this.manaGenerated)
	}
}
