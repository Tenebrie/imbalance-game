import ServerGame from '../ServerGame'
import TargetValidatorArguments from '../../../types/TargetValidatorArguments'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import StandardTargetDefinitionBuilder from './StandardTargetDefinitionBuilder'
import TargetDefinitionBuilder from './TargetDefinitionBuilder'
import TargetDefinition from './TargetDefinition'

export default class SimpleTargetDefinitionBuilder implements TargetDefinitionBuilder {
	builder: StandardTargetDefinitionBuilder
	targetMode: TargetMode

	public build(): TargetDefinition {
		return this.builder.build()
	}

	public singleTarget(): SimpleTargetDefinitionBuilder {
		this.builder.singleTarget()
		return this
	}

	public multipleTargets(count: number): SimpleTargetDefinitionBuilder {
		this.builder.multipleTargets(count)
		return this
	}

	public label(type: TargetType, label: string): SimpleTargetDefinitionBuilder {
		this.builder.label(this.targetMode, type, label)
		return this
	}

	public allow(type: TargetType, atMost: number = 1): SimpleTargetDefinitionBuilder {
		this.builder.allow(this.targetMode, type, atMost)
		return this
	}

	public disallowType(type: TargetType): SimpleTargetDefinitionBuilder {
		this.builder.disallowType(this.targetMode, type)
		return this
	}

	public validate(type: TargetType, validator: (args: TargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder {
		this.builder.validate(this.targetMode, type, validator)
		return this
	}

	public clearValidation(type: TargetType): SimpleTargetDefinitionBuilder {
		this.builder.clearValidation(this.targetMode, type)
		return this
	}

	public allowSimultaneously(left: TargetType, right: TargetType): SimpleTargetDefinitionBuilder {
		this.builder.allowSimultaneously([this.targetMode, left], [this.targetMode, right])
		return this
	}

	public unique(targetType: TargetType): SimpleTargetDefinitionBuilder {
		this.builder.unique(this.targetMode, targetType)
		return this
	}

	public inUnitRange(targetType: TargetType): SimpleTargetDefinitionBuilder {
		this.builder.inUnitRange(this.targetMode, targetType)
		return this
	}

	public inStaticRange(targetType: TargetType, range: number): SimpleTargetDefinitionBuilder {
		this.builder.inStaticRange(this.targetMode, targetType, range)
		return this
	}

	public alliedUnit(): SimpleTargetDefinitionBuilder {
		this.builder.alliedUnit(this.targetMode)
		return this
	}

	public enemyUnit(): SimpleTargetDefinitionBuilder {
		this.builder.enemyUnit(this.targetMode)
		return this
	}

	public notSelf(): SimpleTargetDefinitionBuilder {
		this.builder.notSelf(this.targetMode)
		return this
	}

	public merge(targetDefinition: StandardTargetDefinitionBuilder): SimpleTargetDefinitionBuilder {
		this.builder.merge(targetDefinition)
		return this
	}

	public static base(game: ServerGame, targetMode: TargetMode): SimpleTargetDefinitionBuilder {
		const wrapper = new SimpleTargetDefinitionBuilder()
		wrapper.builder = StandardTargetDefinitionBuilder.base(game)
		wrapper.targetMode = targetMode
		return wrapper
	}
}
