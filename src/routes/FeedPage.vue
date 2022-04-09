<template>
    <v-container fluid>
        <h3 class="text-h4 justify-center">{{ $t('titles.' + feedName) }}</h3>
        <v-row align="center" align-content="center" dense>
            <v-col cols="auto" v-if="$store.getters['auth/isCurrentlyAuthenticated']">
                <v-btn outlined color="primary" link to="/subscriptions">
                    <v-icon>{{ mdiYoutubeSubscription }}</v-icon>
                    {{ $t('actions.view_subscriptions') }}
                </v-btn>
            </v-col>
            <v-col cols="auto" v-if="$store.getters['auth/isCurrentlyAuthenticated']">
                <v-btn
                        outlined color="primary"
                        link :href="$store.getters['prefs/apiUrl'] + '/feed/rss?authToken=' + $store.getters['auth/authToken']"
                >
                    <v-icon>{{ mdiRss }}</v-icon>
                    {{ $t('actions.rss_of_subscriptions') }}
                </v-btn>
            </v-col>
        </v-row>

        <v-divider class="my-4" />

        <NGErrorHandler :error="error" :errorIsJSON="errorIsJSON" />
        <GridRow>
            <GridCol v-for="video in currentVideos" :key="video.url">
                <VideoItem :video="video" max-height />
            </GridCol>
        </GridRow>
        <v-pagination v-model="currentPage" :total-visible="7" :length="Math.ceil(videos.length / PAGE_SIZE)" />
    </v-container>
</template>

<script>
import axios from 'axios'

import { mdiYoutubeSubscription, mdiRss } from '@mdi/js'

import VideoItem from '@/components/Video/VideoItem.vue'
import NGErrorHandler from '@/components/NGErrorHandler'
import GridRow from '@/components/Grid/GridRow'
import GridCol from '@/components/Grid/GridCol'

const PAGE_SIZE = 50
let lastAbortController = new AbortController()

export default {
	data () {
		return {
			feedName: 'trending',
			videos: [],
			error: null,
			errorIsJSON: false,

			currentPage: 1,
			PAGE_SIZE,

			mdiRss,
			mdiYoutubeSubscription
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
			const region = this.$store.getters['prefs/getPreference']('region', this.$route.query.region ?? 'US')
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
	computed: {
		currentVideos () {
			const start = (this.currentPage - 1) * PAGE_SIZE
			return this.videos.slice(start, start + PAGE_SIZE)
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
