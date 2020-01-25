<template>
	<div class="login">
		<the-login-form />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import TheLoginForm from '../components/login/TheLoginForm.vue'

export default Vue.extend({
	components: { TheLoginForm },

	computed: {

	}
})
</script>
