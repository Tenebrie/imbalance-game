import {Component} from 'vue'
import {defineModule} from 'direct-vuex'
import {moduleActionContext} from '@/Vue/store'

const PopupModule = defineModule({
	namespaced: true,
	state: {
		componentStack: [] as Component[]
	},

	mutations: {
		pushComponent(state, component: Component): void {
			state.componentStack.push(component)
		},

		popComponent(state): void {
			state.componentStack.pop()
		},

		clearComponents(state): void {
			state.componentStack = []
		}
	},

	getters: {
		component: (state): Component | null => {
			if (state.componentStack.length === 0) {
				return null
			}
			return state.componentStack[state.componentStack.length - 1]
		}
	},

	actions: {
		open(context, payload: { component: any }): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.pushComponent(payload.component)
		},

		close(context): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.popComponent()
		},

		closeAll(context): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.clearComponents()
		},
	}
})

export default PopupModule
