<template>
	<div class="admin-view">
		<div class="container">
			<div class="navigation">
				<router-link tag="span" :to="{ name: 'admin-games' }" class="router-link"> Game history </router-link>
				<router-link tag="span" :to="{ name: 'admin-users' }" class="router-link"> Registered users </router-link>
				<router-link tag="span" :to="{ name: 'admin-cards' }" class="router-link"> Card library </router-link>
				<router-link tag="span" :to="{ name: 'admin-stats' }" class="router-link"> Statistics & Graphics </router-link>
			</div>
			<div class="content">
				<router-view />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
	components: {},
})
</script>

<style scoped lang="scss">
@import '../styles/generic';

.admin-view {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;

	.container {
		max-width: 1800px;
		display: flex;
		align-items: flex-end;
		flex-direction: row;
		justify-content: center;
		height: 100%;

		& > div {
			height: 100%;
			flex-grow: 0;
			display: flex;
			flex-direction: column;
			background: $COLOR-BACKGROUND-TRANSPARENT;
		}

		.navigation {
			flex: 1;
			margin-right: 32px;
			min-width: 224px;
			justify-content: center;
			align-items: flex-start;
			padding: 0 16px;
			font-size: 1.5em;
			line-height: 1.5em;

			.router-link {
				cursor: pointer;
			}

			.router-link:hover {
				text-decoration: underline;
			}

			.router-link-active {
				font-weight: bold;
			}
		}

		.content {
			flex: 5;
		}
	}
}
</style>
