<template>
    <v-container fluid>
        <h5 class="text-h5 text-center">
            {{ $route.query.search_query }}
        </h5>

        <v-select
            label="Filter videos"
            :value="$route.query.filter"
            @change="$router.push({ query: { ...$route.query, filter: $event }})"
            :items="availableFilters"
        />
        <v-divider class="my-4" />

        <div v-if="results && results.items">
            <GridRow>
                <GridCol v-for="(video, videoId) in results.items" :key="videoId">
                    <VideoItem :height="270" :width="480" :video="video" max-height v-if="video.type === 'VIDEO'" />
                    <GenericDisplayItem :height="270" :width="480" :item="video" v-else />
                </GridCol>
            </GridRow>
            <v-progress-linear
                indeterminate
                v-intersect="onSearchResultsEndIntersect"
                v-if="results.nextpage != null"
            />
        </div>
    </v-container>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'
import VideoItem from '@/components/Video/VideoItem'
import GenericDisplayItem from '@/components/GenericDisplayItem'
import GridRow from '@/components/Grid/GridRow'
import GridCol from '@/components/Grid/GridCol'

export default {
	components: {
		GridRow,
		GridCol,
		GenericDisplayItem,
		VideoItem
	},
	data () {
		return {
			results: null,
			availableFilters: [
				'all',
				'videos',
				'channels',
				'playlists',
				'music_songs',
				'music_videos',
				'music_albums',
				'music_playlists'
			]
		}
	},
	metaInfo () {
		return {
			title: this.$route.query.search_query
		}
	},

	mounted () {
		this.updateResults()
	},
	watch: {
		// For history navigation
		'$route.query.search_query' () {
			this.updateResults()
		},
		'$route.query.filter' () {
			this.updateResults()
		}
	},

	methods: {
		rationalizeSearchResult (sr) {
			let type
			// This seriously can't be the best solution
			if (sr.url.startsWith('/watch')) {
				type = 'VIDEO'
			} else if (sr.url.startsWith('/playlist')) {
				type = 'PLAYLIST'
			} else if (sr.url.startsWith('/channel')) {
				type = 'CHANNEL'
			} else {
				console.warn('WARNING: UNKNOWN VIDEO URL TYPE FOUND:', sr.url)
				type = 'VIDEO'
			}

			return {
				title: sr.name,
				type,
				uploaderName: sr.uploader,
				uploadedDate: sr.uploadDate,
				...sr
			}
		},

		async fetchResults () {
			return this.$store.dispatch('auth/makeRequest', {
				path: 'search',
				params: {
					q: this.$route.query.search_query,
					filter: this.$route.query.filter ?? 'all'
				}
			})
		},

		timeFormat (...args) {
			return LibPiped.timeFormat(...args)
		},
		async updateResults () {
			this.results = this.fetchResults().then(json => {
				json.items = json.items.map(this.rationalizeSearchResult)
				this.results = json
			})
		},
		onSearchResultsEndIntersect (entries) {
			if (entries[0].isIntersecting) {
				this.fetchMoreResults()
			}
		},

		fetchMoreResults () {
			this.$store.dispatch('auth/makeRequest', {
				path: '/nextpage/search',
				params: {
					nextpage: this.results.nextpage,
					q: this.$route.query.search_query,
					filter: this.selectedFilter
				}
			}).then(json => {
				this.results.nextpage = json.nextpage
				this.results.id = json.id
				this.results.items = this.results.items.concat(json.items.map(this.rationalizeSearchResult))
			})
		}
	}
}
</script>
