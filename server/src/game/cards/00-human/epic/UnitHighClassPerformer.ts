import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import {UnitDeployedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '../../../buffs/BuffStrength'
import CardFeature from '@shared/enums/CardFeature'
import TargetDefinition from '../../../models/targetDefinitions/TargetDefinition'

export default class UnitHighClassPerformer extends ServerCard {
	bonusPower = 1
	cardsRequired = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
			cardsRequired: this.cardsRequired
		}

		this.createPlayTargets()
			.merge(TargetDefinition.defaultCardPlayTarget(this.game))
			.require(TargetType.BOARD_ROW, ({ targetRow }) => targetRow.cards.length >= this.cardsRequired)

		this.createEffect<UnitDeployedEventArgs>(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy(): void {
		const otherAlliedRows = this.game.board.rows
			.filter(row => row.owner === this.owner)
			.filter(row => row.index !== this.unit.rowIndex)

		const alliedUnitsOnTargetRows = otherAlliedRows
			.map(row => row.cards)
			.flat()

		alliedUnitsOnTargetRows.forEach(unit => {
			unit.buffs.addMultiple(BuffStrength, this.bonusPower, this)
		})
	}
}
