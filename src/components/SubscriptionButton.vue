<template>
  <v-btn
    v-if="showButtons" outlined color="primary" @click.prevent="subscribeHandler"
    class="ml-2"
  >
    {{ subscribed ? $t('actions.unsubscribe') : $t('actions.subscribe') }}
  </v-btn>
</template>

<script>
export default {
	props: ['channelId'],
	data: () => ({
		showButtons: false,
		subscribed: false
	}),

	methods: {
		async checkStatus () {
			this.showButtons = false
			if (!(this.channelId && this.isAuthenticated)) {
				return
			}

			const resp = await this.$store.dispatch('auth/makeRequest', {
				path: '/subscribed',
				params: {
					channelId: this.channelId
				}
			})

			this.subscribed = resp.subscribed
			this.showButtons = true
		},

		async subscribeHandler () {
			await this.$store.dispatch('auth/makeRequest', {
				method: 'POST',
				path: (this.subscribed ? '/unsubscribe' : '/subscribe'),
				data: {
					channelId: this.channelId
				}
			})
			this.subscribed = !this.subscribed
		}
	},
	computed: {
		isAuthenticated () {
			return this.$store.getters['auth/isCurrentlyAuthenticated']
		}
	},
	mounted () {
		this.checkStatus()
	},
	watch: {
		channelId: 'checkStatus',
		isAuthenticated: 'checkStatus'
	}
}
</script>
