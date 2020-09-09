import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import ServerBoardRow from '../../../models/ServerBoardRow'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffBurning from '../../../buffs/BuffBurning'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroFlameDancer extends ServerCard {
	burnDuration = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY],
			generatedArtworkMagicString: '2',
			stats: {
				power: 5
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			burnDuration: this.burnDuration
		}

		this.createDeployEffectTargets()
			.target(TargetType.BOARD_ROW)
			.require(TargetType.BOARD_ROW, args => {
				return args.targetRow.owner === args.sourceCardOwner.opponent && args.targetRow.cards.length > 0
			})

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetRow }) => this.onTargetSelected(targetRow))
	}

	private onTargetSelected(target: ServerBoardRow): void {
		const targetUnits = target.cards
		const targetCards = targetUnits.map(unit => unit.card)

		targetUnits.forEach(targetUnit => {
			this.game.animation.createAnimationThread()
			targetUnit.card.buffs.add(BuffBurning, this, BuffDuration.FULL_TURN * this.burnDuration - 1)
			this.game.animation.commitAnimationThread()
		})
	}
}
