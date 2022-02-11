<template>
    <NGErrorHandler v-if="error" :error="error"  />
</template>

<script>
import NGErrorHandler from '@/components/NGErrorHandler'

export default {
	components: { NGErrorHandler },
	data: () => ({
		error: null
	}),

	async mounted () {
		let out

		try {
			out = await this.$store.dispatch('auth/makeRequest', {
				method: 'GET',
				path: '/clips/' + this.$route.params.clipId
			})
		} catch (e) {
			if (e.isAxiosError) {
				this.error = e.response.data
			} else {
				throw e
			}
		}

		if (out.videoId) {
			this.$router.push({
				path: '/video',
				query: {
					v: out.videoId
				}
			})
		}
	}
}
</script>
