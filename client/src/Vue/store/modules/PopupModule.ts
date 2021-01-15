import { Component } from 'vue'
import { defineModule } from 'direct-vuex'
import { moduleActionContext } from '@/Vue/store'

type ComponentInStack = {
	component: Component
	sticky?: boolean
	params?: Record<string, string> | undefined
	onConfirm?: () => void
}

const PopupModule = defineModule({
	namespaced: true,
	state: {
		componentStack: [] as ComponentInStack[],
	},

	mutations: {
		pushComponent(state, component: ComponentInStack): void {
			state.componentStack.push(component)
		},

		popComponent(state): void {
			state.componentStack.pop()
		},

		clearComponents(state): void {
			state.componentStack = []
		},
	},

	getters: {
		component: (state): Component | null => {
			if (state.componentStack.length === 0) {
				return null
			}
			return state.componentStack[state.componentStack.length - 1].component
		},

		sticky: (state): boolean => {
			if (state.componentStack.length === 0) {
				return false
			}
			return !!state.componentStack[state.componentStack.length - 1].sticky
		},

		params: (state): Record<string, string> | undefined => {
			if (state.componentStack.length === 0) {
				return undefined
			}
			return state.componentStack[state.componentStack.length - 1].params
		},

		onConfirm: (state): (() => void | undefined) => {
			if (state.componentStack.length === 0) {
				return undefined
			}
			return state.componentStack[state.componentStack.length - 1].onConfirm
		},
	},

	actions: {
		open(context, payload: ComponentInStack): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.pushComponent(payload)
		},

		close(context): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.popComponent()
		},

		closeAll(context): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.clearComponents()
		},
	},
})

export default PopupModule
