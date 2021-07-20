<template>
  <v-container fluid>
    <h3 class="display-1 justify-center">Trending</h3>

    <v-divider class="my-4" />

    <v-row v-for="(row, rowId) in chunkedByFour" :key="rowId">
      <v-col md="3" v-for="(video, videoId) in row" :key="videoId">
        <VideoItem :video="video" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { chunk as _chunk } from 'lodash-es'

import VideoItem from '@/components/VideoItem.vue'
import { LibPiped } from '@/tools/libpiped'

export default {
  data () {
    return {
      videos: []
    }
  },
  mounted () {
    // Reimplement using vue-meta
    // document.title = 'Trending - Piped'

    const region = LibPiped.getPreferenceString('region', 'US')

    this.fetchTrending(region).then(videos => (this.videos = videos))
  },
  methods: {
    async fetchTrending (region) {
      return LibPiped.fetchJson('/trending', {
        region: region || 'US'
      })
    }
  },
  computed: {
    chunkedByFour () {
      return _chunk(this.videos, 4)
    }
  },
  components: {
    VideoItem
  }
}
</script>
