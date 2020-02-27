import TargetDefinition from './TargetDefinition'

export default interface TargetDefinitionBuilder {
	build(): TargetDefinition
	merge(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder
}
