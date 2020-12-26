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

export default class UnitManaSilo extends ServerCard {
	maxInfuse = 3
	manaInfused = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			features: [CardFeature.BUILDING, CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_INFUSE_X],
			stats: {
				power: 0,
				armor: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			maxInfuse: this.maxInfuse,
			manaInfused: () => String(this.manaInfused),
			counterVisible: () => this.location === CardLocation.BOARD,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => this.ownerInGame.spellMana > 0)
			.perform(() => {
				this.manaInfused = Math.min(this.maxInfuse, this.ownerInGame.spellMana)
				Keywords.infuse(this, this.manaInfused)
			})

		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.BOARD])
			.require(({ player }) => player === this.owner)
			.require(() => this.manaInfused > 0)
			.perform(() => {
				this.ownerInGame.addSpellMana(this.manaInfused)
				this.manaInfused = 0
			})

		this.createEffect(GameEventType.UNIT_DESTROYED).perform(() => {
			this.manaInfused = 0
		})
	}
}
