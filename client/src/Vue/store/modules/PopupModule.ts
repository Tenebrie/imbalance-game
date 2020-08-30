import {Component} from 'vue'
import {createModule} from 'direct-vuex'
import {moduleActionContext} from '@/Vue/store'
import {ComponentRenderProxy} from '@vue/composition-api'

const PopupModule = createModule({
	namespaced: true,
	state: {
		component: null as Component | null
	},

	mutations: {
		setComponent(state, component: Component | null): void {
			state.component = component
		}
	},

	actions: {
		open(context, payload: { component: any }): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.setComponent(payload.component)
		},

		close(context): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.setComponent(null)
		},
	}
})

export default PopupModule
