export class StatOverride {
	public readonly callbacks: ((value: number) => number)[]

	constructor(callbacks: ((value: number) => number)[]) {
		this.callbacks = callbacks
	}

	public apply(value: number): number {
		return this.callbacks.reduce<number>((newValue, callback) => callback(newValue), value)
	}
}

export class StatOverrideBuilder {
	private callbacks: ((value: number) => number)[]

	constructor() {
		this.callbacks = []
	}

	public setTo(valueToSet: number): StatOverrideBuilder {
		this.callbacks.push(() => valueToSet)
		return this
	}

	public add(valueToAdd: number): StatOverrideBuilder {
		this.callbacks.push((value) => value + valueToAdd)
		return this
	}

	public substract(valueToSubstract: number): StatOverrideBuilder {
		this.callbacks.push((value) => value - valueToSubstract)
		return this
	}

	public __build(): StatOverride {
		return new StatOverride(this.callbacks)
	}
}
