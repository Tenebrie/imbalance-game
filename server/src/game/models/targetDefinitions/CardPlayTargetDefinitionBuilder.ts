import ServerGame from '../ServerGame'
import TargetValidatorArguments from '../../../types/TargetValidatorArguments'
import TargetMode from '../../shared/enums/TargetMode'
import TargetType from '../../shared/enums/TargetType'
import StandardTargetDefinitionBuilder from './StandardTargetDefinitionBuilder'
import TargetDefinitionBuilder from './TargetDefinitionBuilder'
import ServerTargetDefinition from './ServerTargetDefinition'

export default class CardPlayTargetDefinitionBuilder implements TargetDefinitionBuilder {
	builder: StandardTargetDefinitionBuilder

	public build(): ServerTargetDefinition {
		return this.builder.build()
	}

	public singleTarget(): CardPlayTargetDefinitionBuilder {
		this.builder.singleTarget()
		return this
	}

	public multipleTargets(count: number): CardPlayTargetDefinitionBuilder {
		this.builder.multipleTargets(count)
		return this
	}

	public label(type: TargetType, label: string): CardPlayTargetDefinitionBuilder {
		this.builder.label(TargetMode.ON_PLAY, type, label)
		return this
	}

	public allow(type: TargetType, atMost: number = 1): CardPlayTargetDefinitionBuilder {
		this.builder.allow(TargetMode.ON_PLAY, type, atMost)
		return this
	}

	public disallowType(type: TargetType): CardPlayTargetDefinitionBuilder {
		this.builder.disallowType(TargetMode.ON_PLAY, type)
		return this
	}

	public validate(type: TargetType, validator: (args: TargetValidatorArguments) => boolean): CardPlayTargetDefinitionBuilder {
		this.builder.validate(TargetMode.ON_PLAY, type, validator)
		return this
	}

	public clearValidation(type: TargetType): CardPlayTargetDefinitionBuilder {
		this.builder.clearValidation(TargetMode.ON_PLAY, type)
		return this
	}

	public allowSimultaneously(left: TargetType, right: TargetType): CardPlayTargetDefinitionBuilder {
		this.builder.allowSimultaneously([TargetMode.ON_PLAY, left], [TargetMode.ON_PLAY, right])
		return this
	}

	public unique(targetType: TargetType): CardPlayTargetDefinitionBuilder {
		this.builder.unique(TargetMode.ON_PLAY, targetType)
		return this
	}

	public inUnitRange(targetType: TargetType): CardPlayTargetDefinitionBuilder {
		this.builder.inUnitRange(TargetMode.ON_PLAY, targetType)
		return this
	}

	public inStaticRange(targetType: TargetType, range: number): CardPlayTargetDefinitionBuilder {
		this.builder.inStaticRange(TargetMode.ON_PLAY, targetType, range)
		return this
	}

	public alliedUnit(): CardPlayTargetDefinitionBuilder {
		this.builder.alliedUnit(TargetMode.ON_PLAY)
		return this
	}

	public enemyUnit(): CardPlayTargetDefinitionBuilder {
		this.builder.enemyUnit(TargetMode.ON_PLAY)
		return this
	}

	public notSelf(): CardPlayTargetDefinitionBuilder {
		this.builder.notSelf(TargetMode.ON_PLAY)
		return this
	}

	public static base(game: ServerGame): CardPlayTargetDefinitionBuilder {
		const wrapper = new CardPlayTargetDefinitionBuilder()
		wrapper.builder = StandardTargetDefinitionBuilder.base(game)
		return wrapper
	}
}
