import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellHealingRain extends ServerCard {
	baseHealing = 3
	healingPerStorm = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.TOKEN,
			faction: CardFaction.NATURE,
			tribes: [CardTribe.STORM],
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			healing: () => this.healing,
			healingPerStorm: this.healingPerStorm
		}
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createEffect(GameEventType.SPELL_DEPLOYED)
			.perform(() => this.onPlay())
	}

	private get healing(): number {
		let stormsPlayed = 0
		if (this.owner) {
			stormsPlayed = this.owner.cardGraveyard.findCardsByTribe(CardTribe.STORM).length
		}

		return this.baseHealing + this.healingPerStorm * stormsPlayed
	}

	private onPlay(): void {
		const targets = this.game.board.getUnitsOwnedByPlayer(this.owner)
			.filter(target => target.card.stats.power < target.card.stats.maxPower)

		targets.forEach(target => {
			target.heal(ServerDamageInstance.fromCard(this.healing, this))
		})
	}
}
