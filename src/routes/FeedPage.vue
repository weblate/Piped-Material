<template>
  <v-container fluid>
    <h3 class="text-h4 justify-center">{{ $t('titles.' + feedName) }}</h3>
    <v-btn outlined color="primary" class="mt-2" v-if="$store.getters['auth/isCurrentlyAuthenticated']" link to="/subscriptions">Your Subscriptions</v-btn>
    <v-btn
      outlined color="primary" class="mt-2 ml-2"
      v-if="$store.getters['auth/isCurrentlyAuthenticated']"
      link :href="$store.getters['prefs/apiUrl'] + '/feed/rss?authToken=' + $store.getters['auth/authToken']"
    >
      <v-icon>mdi-rss</v-icon> RSS of Your Subscriptions
    </v-btn>

    <v-divider class="my-4" />

    <v-alert v-if="error" color="error" prominent text>
      <span v-if="!errorIsJSON">{{ $t(error) }}</span>
      <JSONViewer v-else :value="error" />
    </v-alert>
    <div v-for="(row, rowId) in splitIntoRows" :key="rowId" :class="$vuetify.breakpoint.mdAndUp ? 'grid' : undefined">
      <VideoItem :video="video" v-for="(video, videoId) in row" :key="videoId" :class="columnClass" />
    </div>
  </v-container>
</template>

<script>
import { chunk as _chunk } from 'lodash-es'

import VideoItem from '@/components/VideoItem.vue'

export default {
	data () {
		return {
			feedName: 'trending',
			videos: [],
			error: null,
			errorIsJSON: false
		}
	},

	metaInfo () {
		return {
			title: this.$t('titles.' + this.feedName)
		}
	},

	watch: {
		'$route.path': 'fetchData'
	},
	mounted () {
		this.fetchData()
	},
	methods: {
		async fetchData () {
			const region = this.$store.getters['prefs/getPreference']('region', 'US')
			const selectedHomepage = this.$store.getters['prefs/getPreference']('homepage', 'trending')
			let path

			switch (this.$route.path) {
				case '/':
					if (selectedHomepage === 'trending') {
						path = '/trending'
						this.feedName = 'trending'
					} else {
						path = '/feed'
						this.feedName = 'feed'
					}
					break
				case '/trending':
					path = '/trending'
					this.feedName = 'trending'
					break
				case '/feed':
					path = '/feed'
					this.feedName = 'feed'
					break
			}

			try {
				this.error = null
				this.videos = await this.$store.dispatch('auth/makeRequest', {
					path,
					params: {
						region: region
					},
					tokenInParams: true
				})
			} catch (e) {
				if (e.isAxiosError) {
					const rData = e.response.data
					if (rData.message === 'Could not get Trending name') {
						this.error = 'errors.trendingFetchError'
					} else {
						this.error = rData
						this.errorIsJSON = true
					}
				} else {
					throw e
				}
			}
		}
	},
	computed: {
		rowSize () {
			return this.$store.getters['prefs/getPreferenceNumber']('feedColumns', 4)
		},

		columnClass () {
			if (!this.$vuetify.breakpoint.mdAndUp) {
				return
			}
			return 'span-col-' + (60 / this.rowSize) + ' mb-4'
		},

		splitIntoRows () {
			return _chunk(this.videos, this.rowSize)
		}
	},
	components: {
		VideoItem,
		JSONViewer: () => import('vue-json-viewer')
	}
}
</script>

<style scoped>
/* A 60-point grid generated for this page and this page only */
/* Why, one might ask, when you have the Vuetify grid? */
/* The reason being that Vuetify grid is 12-point, therefore 5 column layouts don't work */
.grid {
  display: grid;
  grid-template-columns: repeat(60, 1fr);
  grid-gap: 16px;
}

.span-col-12{grid-column: span 12 / auto;}

.span-col-15{grid-column: span 15 / auto;}

.span-col-10{grid-column: span 10 / auto;}
</style>
