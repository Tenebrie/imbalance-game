<template>
	<div class="the-password-policy">
		<div class="header">Password policy:</div>
		<div class="content">- Password should be at least <b>1</b> characters long</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-password-policy {
	text-align: left;

	.header {
		font-weight: bold;
	}
}
</style>
