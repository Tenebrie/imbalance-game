import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitManaSilo extends ServerCard {
	maxInfuse = 3
	manaInfused = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH, CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_INFUSE_X],
			stats: {
				power: 0,
				armor: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			maxInfuse: this.maxInfuse,
			manaInfused: () => String(this.manaInfused),
			counterVisible: () => this.location === CardLocation.BOARD,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => this.ownerPlayerInGame.spellMana > 0)
			.perform(() => {
				this.manaInfused = Math.min(this.maxInfuse, this.ownerPlayerInGame.spellMana)
				Keywords.infuse(this, this.manaInfused)
			})

		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.require(() => this.manaInfused > 0)
			.perform(() => {
				this.ownerPlayerInGame.addSpellMana(this.manaInfused)
				this.manaInfused = 0
			})

		this.createEffect(GameEventType.UNIT_DESTROYED).perform(() => {
			this.manaInfused = 0
		})
	}
}
