import { defineModule } from 'direct-vuex'

const HotkeysModule = defineModule({
	namespaced: true,
	state: {
		fastAnimation: false as boolean,
		ultraFastAnimation: false as boolean,
	},

	mutations: {
		setFastAnimation(state, value: boolean): void {
			state.fastAnimation = value
		},

		setUltraFastAnimation(state, value: boolean): void {
			state.ultraFastAnimation = value
		},
	},
})

export default HotkeysModule
