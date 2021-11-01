<template>
  <v-container fluid>
    <h3 class="text-h4 justify-center">{{ $t('titles.' + feedName) }}</h3>

    <v-divider class="my-4" />

    <v-alert v-if="error" color="error" prominent text>
      <span v-if="!errorIsJSON">{{ $t(error) }}</span>
      <JSONViewer v-else :value="error" />
    </v-alert>
    <v-row v-for="(row, rowId) in chunkedByFour" :key="rowId">
      <v-col md="3" v-for="(video, videoId) in row" :key="videoId">
        <VideoItem :video="video" max-height />
      </v-col>
    </v-row>
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
    chunkedByFour () {
      return _chunk(this.videos, 4)
    }
  },
  components: {
    VideoItem,
    JSONViewer: () => import('vue-json-viewer')
  }
}
</script>
