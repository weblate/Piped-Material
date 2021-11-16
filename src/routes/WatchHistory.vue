<template>
  <v-progress-linear height="1vh" indeterminate v-if="loaded === false" />
  <v-container fluid v-else>
    <v-row>
      <v-col md="2">
        <v-btn outlined @click="deleteWatchHistory" x-large>Delete History</v-btn>
      </v-col>
    </v-row>
    <v-row v-for="(chunk, chunkId) in chunkedByFour" :key="chunkId">
      <v-col md="3" v-for="doc in chunk" :key="doc._id">
        <VideoItem :video="doc.video" :src-progress="doc.progress" max-height>
          <ExpandableDate :date="doc.timestamp">
            Watched
          </ExpandableDate>
          <br />
        </VideoItem>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _chunk from 'lodash-es/chunk'

import { deleteWatchedVideos, getWatchedVideos } from '@/store/watched-videos-db'
import VideoItem from '@/components/VideoItem'
import ExpandableDate from '@/components/ExpandableDate'

export default {
  components: {
    ExpandableDate,
    VideoItem
  },
  data: () => ({
    loaded: false,
    data: null
  }),

  metaInfo () {
    return {
      title: this.$t('titles.history')
    }
  },

  methods: {
    async loadData () {
      this.data = await getWatchedVideos()
      this.loaded = true
    },

    async deleteWatchHistory () {
      await deleteWatchedVideos()
      await this.loadData()
    }
  },

  computed: {
    chunkedByFour () {
      return _chunk(this.data, 4)
    }
  },

  mounted () {
    this.loadData().catch(e => console.error(e))
  }
}
</script>
