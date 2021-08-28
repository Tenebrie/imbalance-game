import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardTribe from '@src/../../shared/src/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'

export default class SpellBecomeTheSalvage extends ServerCard {
	charges = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.HERO_POWER, CardFeature.KEYWORD_EXILE],
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

		// TODO: Write unit tests for this thing
		this.createDeployTargets(TargetType.CARD_IN_SPELL_GRAVEYARD)
			.require(() => this.charges > 0)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.SALVAGE))
			.require(({ targetCard }) => this.ownerGroup.owns(targetCard))
			.perform(({ targetCard }) => {
				this.ownerPlayer.addSpellMana(targetCard.stats.spellCost)
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
