<template>
	<i class="fa fa-spinner" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

i {
	-webkit-animation: spin 4s linear infinite;
	-moz-animation: spin 4s linear infinite;
	animation: spin 4s linear infinite;
}
@-moz-keyframes spin {
	100% {
		-moz-transform: rotate(360deg);
	}
}
@-webkit-keyframes spin {
	100% {
		-webkit-transform: rotate(360deg);
	}
}
@keyframes spin {
	100% {
		-webkit-transform: rotate(360deg);
		transform: rotate(360deg);
	}
}
</style>
