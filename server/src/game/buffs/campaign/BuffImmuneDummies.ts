import ServerBuff, { BuffConstructorParams } from '../../models/buffs/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import UnitChallengeDummyOPWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyOPWarrior'
import BuffImmunity from '../BuffImmunity'

export default class BuffImmuneDummies extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createSelector()
			.requireTarget(({ target }) => target instanceof UnitChallengeDummyOPWarrior)
			.provide(BuffImmunity)
	}
}
