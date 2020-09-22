import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroElderElemental extends ServerCard {
	manaGenerated = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_TURN_START],
			stats: {
				power: 9
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())

		this.createCallback(GameEventType.TURN_STARTED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const player = this.owner!
		player.setSpellMana(player.spellMana + this.manaGenerated)
	}
}
