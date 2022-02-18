<template>
    <v-container fluid>
        <h3 class="text-h4 justify-center">{{ $t('titles.' + feedName) }}</h3>
        <v-btn outlined color="primary" class="mt-2" v-if="$store.getters['auth/isCurrentlyAuthenticated']" link to="/subscriptions">
            {{ $t('actions.view_subscriptions') }}
        </v-btn>
        <v-btn
            outlined color="primary" class="mt-2 ml-2"
            v-if="$store.getters['auth/isCurrentlyAuthenticated']"
            link :href="$store.getters['prefs/apiUrl'] + '/feed/rss?authToken=' + $store.getters['auth/authToken']"
        >
            <v-icon>{{ mdiRss }}</v-icon>
            {{ $t('actions.rss_of_subscriptions') }}
        </v-btn>

        <v-divider class="my-4" />

        <NGErrorHandler :error="error" :errorIsJSON="errorIsJSON" />
        <GridRow>
            <GridCol v-for="video in videos" :key="video.url">
                <VideoItem :video="video" max-height />
            </GridCol>
        </GridRow>
    </v-container>
</template>

<script>
import axios from 'axios'

import { mdiRss } from '@mdi/js'

import VideoItem from '@/components/VideoItem.vue'
import NGErrorHandler from '@/components/NGErrorHandler'
import GridRow from '@/components/Grid/GridRow'
import GridCol from '@/components/Grid/GridCol'

let lastAbortController = new AbortController()

export default {
	data () {
		return {
			feedName: 'trending',
			videos: [],
			error: null,
			errorIsJSON: false,

			mdiRss
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
			lastAbortController.abort()
			lastAbortController = new AbortController()

			try {
				this.error = null
				this.videos = await this.$store.dispatch('auth/makeRequest', {
					path,
					signal: lastAbortController.signal,
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
				} else if (e instanceof axios.Cancel) {
					return null
				} else {
					throw e
				}
			}
		}
	},
	components: {
		GridRow,
		GridCol,
		NGErrorHandler,
		VideoItem
	}
}
</script>
