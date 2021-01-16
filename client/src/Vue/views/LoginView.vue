<template>
	<div class="login">
		<the-login-form />
	</div>
</template>

<script lang="ts">
import TheLoginForm from '../components/login/TheLoginForm.vue'
import { defineComponent } from 'vue'

export default defineComponent({
	components: { TheLoginForm },

	computed: {},
})
</script>
