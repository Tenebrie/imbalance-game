import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import LeaderStatType from '@shared/enums/LeaderStatType'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { CardConstructor } from '@src/game/libraries/CardLibrary'
import { BuffConstructor } from '@src/game/models/buffs/ServerBuffContainer'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { LeaderStatValueGetter } from '@src/utils/LeaderStats'

const tierToFeature = (tier: number): CardFeature => {
	switch (tier) {
		case 0:
			return CardFeature.LABYRINTH_ITEM_T0
		case 1:
			return CardFeature.LABYRINTH_ITEM_T1
		case 2:
			return CardFeature.LABYRINTH_ITEM_T2
		case 3:
			return CardFeature.LABYRINTH_ITEM_T3
		case 4:
			return CardFeature.LABYRINTH_ITEM_T4
		default:
			throw new Error(`No tier feature for tier ${tier}`)
	}
}

const propsToFeatures = (props?: LabyrinthPassiveItemProps): CardFeature[] => {
	const features = [CardFeature.LABYRINTH_ITEM]
	if (!props) {
		return features
	}
	return features.concat(tierToFeature(props.tier))
}

type LabyrinthPassiveItemProps = {
	slot:
		| CardTribe.LABYRINTH_WEAPON
		| CardTribe.LABYRINTH_ARMOR
		| CardTribe.LABYRINTH_GLOVES
		| CardTribe.LABYRINTH_BOOTS
		| CardTribe.LABYRINTH_TREASURE
	tier: number
	stats?: Partial<Record<LeaderStatType, number>>
	upgrades?: CardConstructor[]
}

type LabyrinthActiveItemProps = LabyrinthPassiveItemProps & {
	stats: {
		cost: number
	} & Partial<Record<LeaderStatType, number>>
}

class ItemLabyrinthBase extends ServerCard {
	public addLeaderPower(value: number | (() => number)): void {
		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroup.owns(this) && target === this.ownerPlayer.leader)
			.provide(BuffStrength, value)
	}

	public addLeaderPowerPerGame(valuePerGame: number): void {
		this.addLeaderPower(() => {
			const state = this.game.progression.labyrinth.state.run
			return valuePerGame * state.encounterHistory.length
		})
	}

	public addBonusUnitPower(value: number | (() => number)): void {
		this.createSelector()
			.requireTarget(({ target }) => target.ownerGroup.owns(this) && target.location === CardLocation.BOARD)
			.provide(BuffStrength, value)
	}

	public addManaRegen(value: number | (() => number)): void {
		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.HAND])
			.require(({ group }) => group.owns(this))
			.perform(() => Keywords.generateMana(this, value))
	}
}

export class BaseLabyrinthPassiveItem extends ItemLabyrinthBase {
	constructor(game: ServerGame, props?: LabyrinthPassiveItemProps) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: props ? [props.slot] : [],
			features: propsToFeatures(props).concat(CardFeature.PASSIVE),
			stats: {
				cost: 0,
				...props?.stats,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
	}
}

export class BaseLabyrinthActiveItem extends ItemLabyrinthBase {
	constructor(game: ServerGame, props?: LabyrinthActiveItemProps) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: props ? [props.slot] : [],
			features: propsToFeatures(props).concat(CardFeature.HERO_POWER),
			stats: {
				cost: props?.stats.cost || 0,
				...props?.stats,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
	}

	public addSingleTargetDamage(damage: number | LeaderStatValueGetter): void {
		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => targetUnit.dealDamage(DamageInstance.fromCard(damage, this)))
	}

	public addSingleTargetDamageWithSplash(damage: number | LeaderStatValueGetter, splashDamage: number | LeaderStatValueGetter): void {
		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const adjacentUnits = this.game.board.getAdjacentUnits(targetUnit)
				targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
				adjacentUnits.forEach((unit) => {
					this.game.animation.thread(() => {
						unit.dealDamage(DamageInstance.fromCard(splashDamage, this))
					})
				})
				this.game.animation.syncAnimationThreads()
			})
	}

	public addSingleTargetDamageWithEffect(damage: number | LeaderStatValueGetter, effect: BuffConstructor): void {
		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				const targetRow = targetUnit.rowIndex
				targetUnit.dealDamage(DamageInstance.fromCard(damage, this))
				this.game.board.rows[targetRow].buffs.add(effect, this)
			})
	}
}

export class BaseLabyrinthArtifactItem extends ItemLabyrinthBase {
	constructor(game: ServerGame, props?: LabyrinthActiveItemProps) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: props ? [props.slot] : [],
			features: propsToFeatures(props).concat(CardFeature.HERO_ARTIFACT),
			stats: {
				cost: props?.stats.cost || 0,
				...props?.stats,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
	}
}
