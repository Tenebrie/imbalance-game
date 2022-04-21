<template>
	<div class="admin-view">
		<div class="container">
			<div class="navigation">
				<router-link tag="span" :to="{ name: 'admin-cards' }" class="router-link"><i class="fas fa-book" /> Card library </router-link>
				<router-link tag="span" :to="{ name: 'admin-games' }" class="router-link"><i class="fas fa-history" /> Game history </router-link>
				<router-link tag="span" :to="{ name: 'admin-users' }" class="router-link"><i class="fas fa-users" /> Registered users </router-link>
				<router-link tag="span" :to="{ name: 'admin-performance' }" class="router-link"
					><i class="fas fa-code" /> System performance
				</router-link>
				<router-link tag="span" :to="{ name: 'admin-templating' }" class="router-link"
					><i class="fas fa-file-circle-plus" /> Card templating
				</router-link>
			</div>
			<div class="content">
				<router-view />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	components: {},
})
</script>

<style scoped lang="scss">
@import '../styles/generic';

.admin-view {
	display: flex;
	align-items: center;
	justify-content: center;
	max-width: $CONTENT_WIDTH;
	height: 100%;

	.container {
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
			font-size: 1.5em;
			line-height: 1.5em;

			.router-link {
				cursor: pointer;
				width: calc(100% - 32px);
				padding: 4px 16px;
				text-align: start;

				&:hover {
					text-decoration: none !important;
					background: $COLOR-BACKGROUND-TRANSPARENT;
				}

				&.router-link-active {
					font-weight: bold;
				}
			}
		}

		.content {
			flex: 5;
		}
	}
}
</style>
