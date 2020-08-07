import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import ServerBoardRow from '../../../models/ServerBoardRow'
import ServerAnimation from '../../../models/ServerAnimation'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffBurning from '../../../buffs/BuffBurning'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class HeroFlameDancer extends ServerCard {
	burnDuration = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 5
		this.dynamicTextVariables = {
			burnDuration: this.burnDuration
		}
		this.generatedArtworkMagicString = '2'

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetRow }) => this.onTargetSelected(targetRow))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.require(TargetType.BOARD_ROW)
			.validate(TargetType.BOARD_ROW, args => {
				return args.targetRow.owner === args.thisUnit.owner.opponent && args.targetRow.cards.length > 0
			})
	}

	private onTargetSelected(target: ServerBoardRow): void {
		const targetUnits = target.cards
		const targetCards = targetUnits.map(unit => unit.card)

		this.game.animation.play(ServerAnimation.cardAffectsCards(this, targetCards))
		targetUnits.forEach(targetUnit => {
			targetUnit.card.buffs.add(BuffBurning, this, BuffDuration.FULL_TURN * this.burnDuration - 1)
		})
		this.game.animation.play(ServerAnimation.cardReceivedBuff(targetCards, BuffAlignment.NEGATIVE))
	}
}
