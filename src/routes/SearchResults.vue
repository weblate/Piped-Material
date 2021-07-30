<template>
  <v-container fluid>
    <h5 class="text-h5 text-center">
      {{ $route.query.search_query }}
    </h5>

    <v-select
      label="Filter videos"
      v-model="selectedFilter"
      :items="availableFilters"
    />
    <v-divider class="my-4" />

    <div v-if="results && results.items">
      <v-row v-for="(row, rowId) in chunkedByFour" :key="rowId">
        <v-col md="3" v-for="(video, videoId) in row" :key="videoId">
          <VideoItem :height="270" :width="480" :video="video" />
        </v-col>
      </v-row>
      <v-progress-linear indeterminate v-intersect="onSearchResultsEndIntersect" />
    </div>
  </v-container>
</template>

<script>
import { chunk as _chunk } from 'lodash-es'

import { LibPiped } from '@/tools/libpiped'
import VideoItem from '@/components/VideoItem'

export default {
  components: { VideoItem },
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
      ],
      selectedFilter: 'all'
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
  computed: {
    chunkedByFour () {
      return _chunk(this.results.items, 4)
    }
  },
  watch: {
    selectedFilter () {
      this.updateResults()
    }
  },

  methods: {
    rationalizeSearchResult (sr) {
      return {
        title: sr.name,
        uploaderName: sr.uploader,
        uploadedDate: sr.uploadDate,
        ...sr
      }
    },

    async fetchResults () {
      return this.$store.dispatch('fetchJson', {
        path: 'search',
        params: {
          q: this.$route.query.search_query,
          filter: this.selectedFilter
        }
      })
    },

    numberFormat (...args) {
      return LibPiped.numberFormat(...args)
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
      this.$store.dispatch('fetchJson', {
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
