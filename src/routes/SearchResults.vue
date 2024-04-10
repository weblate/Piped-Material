<template>
    <v-container fluid>
        <h5 class="text-h5 text-center">
            {{ $route.query.search_query }}
        </h5>

        <v-select
            :label="$t('search_results.filterLabel')"
            :value="filterValue"
            @change="$router.push({ query: { ...$route.query, filter: $event }})"
            :items="options"
        />
        <v-divider class="my-4" />

        <div v-if="filteredResults.length !== 0">
            <GridRow>
                <GridCol v-for="(video, videoId) in filteredResults" :key="videoId">
                    <VideoItem :height="270" :width="480" :video="video" max-height v-if="video.type === 'stream'" />
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
	data: () => ({
		results: null
	}),
	metaInfo () {
		return {
			title: this.$route.query.search_query
		}
	},

	mounted () {
		this.fetchResults()
	},

	computed: {
		filterValue () {
			return this.$route.query.filter ?? 'all'
		},

		options () {
			return [
				'all',
				'videos',
				'channels',
				'playlists',
				'music_songs',
				'music_videos',
				'music_albums',
				'music_playlists'
			].map((name) => ({
				text: this.$t('search_results.result_types.' + name),
				value: name
			}))
		},

		filteredResults () {
			let out = this.results?.items
			if (out == null) {
				return []
			}

			const isShortsFilterEnabled = this.$store.getters['prefs/getPreferenceBoolean']('filterOutShortsInSearchResults', false)
			if (isShortsFilterEnabled) {
				out = out.filter(v => v.isShort === false)
			}

			return out.map(sr => ({
				title: sr.name,
				uploaderName: sr.uploader,
				uploadedDate: sr.uploadDate,
				...sr
			}))
		}
	},

	watch: {
		// For history navigation
		'$route.query.search_query' () {
			this.fetchResults()
		},
		'$route.query.filter' () {
			this.fetchResults()
		}
	},

	methods: {
		async fetchResults () {
			this.results = await this.$store.dispatch('auth/makeRequest', {
				path: 'search',
				params: {
					q: this.$route.query.search_query,
					filter: this.filterValue
				}
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
					filter: this.filterValue
				}
			}).then(json => {
				this.results.nextpage = json.nextpage
				this.results.id = json.id
				this.results.items = this.results.items.concat(json.items)
			})
		}
	}
}
</script>
