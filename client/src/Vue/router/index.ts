import Vue from 'vue'
import store from '@/Vue/store'
import VueRouter, { Route } from 'vue-router'
import axios from 'axios'
import Player from '@/Pixi/shared/models/Player'

Vue.use(VueRouter)

const fetchProfile = async (next: Function): Promise<void> => {
	try {
		const response = await axios.get('/api/profile')
		const player = response.data.data as Player
		store.commit.setPlayerData(player)
	} catch (error) {
		next('/login')
	}
	next()
}

const validateAuthentication = (next: Function): void => {
	if (store.state.isLoggedIn) {
		next()
		return
	}

	fetchProfile(next)
}

const routes = [
	{
		path: '/login',
		name: 'login',
		component: () => import('@/Vue/views/LoginView.vue')
	},
	{
		path: '/register',
		name: 'register',
		component: () => import('@/Vue/views/RegisterView.vue')
	},
	{
		path: '/',
		name: 'home',
		component: () => import('@/Vue/views/HomeView.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			validateAuthentication(next)
		}
	},
	{
		path: '/game',
		name: 'game',
		component: () => import('@/Vue/views/GameView.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			if (!store.state.selectedGameId) {
				next('/')
				return
			}
			validateAuthentication(next)
		}
	}
]

const router = new VueRouter({
	mode: 'history',
	routes
})

export default router
