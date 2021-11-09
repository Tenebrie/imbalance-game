import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class SpellBecomeTheSalvage extends ServerCard {
	charges = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})

		const maxCharges = this.charges
		this.dynamicTextVariables = {
			charges: () => this.charges,
			maxCharges: maxCharges,
		}

		this.createLocalization({
			en: {
				name: 'Become the Salvage',
				description: "Charges: {charges}/{maxCharges}<p>*Exile* a Salvage Spell from your Graveyard.<br>Gain Mana equal to its' cost.",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_SPELL_GRAVEYARD)
			.require(() => this.charges > 0)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.SALVAGE))
			.require(({ targetCard }) => this.ownerGroup.owns(targetCard))
			.perform(({ targetCard }) => {
				this.ownerPlayer.addSpellMana(targetCard.stats.spellCost, this)
				this.ownerPlayer.cardGraveyard.removeCard(targetCard)
			})

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => {
			this.charges -= 1
			if (this.charges <= 0) {
				this.ownerPlayer.cardDeck.removeCard(this)
			}
		})
	}
}
