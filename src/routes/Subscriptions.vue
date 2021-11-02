<template>
  <v-progress-linear v-if="!loaded" />
  <v-container fluid v-else>
    <v-row v-for="(chunk, chunkId) in data" :key="chunkId">
      <v-col md="2" v-for="channel in chunk" :key="channel.name">
        <v-card min-height="100%" outlined link :to="channel.url">
          <v-img :src="channel.avatar" />
          <v-card-title>{{ channel.name }}</v-card-title>
          <v-card-actions>
            <!-- Encapsulate into own item -->
            <v-btn
             outlined color="primary" @click.prevent="channel.subOrUnsub"
             class="ml-2"
            >
              {{ channel.subscribed ? 'Unsubscribe' : 'Subscribe' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { chunk as _chunk } from 'lodash-es'

export default {
  name: 'Subscriptions',
  data: () => ({
    loaded: false,
    data: null
  }),
  methods: {
    async loadData () {
      if (!this.$store.getters['auth/isCurrentlyAuthenticated']) {
        await this.$router.replace({
          path: '/'
        })
        return
      }
      const resp = await this.$store.dispatch('auth/makeRequest', {
        method: 'GET',
        path: '/subscriptions'
      })
      this.loaded = true
      this.data = _chunk(resp.map(itm => {
        itm.subscribed = true
        itm.subOrUnsub = async () => {
          await this.$store.dispatch('auth/makeRequest', {
            method: 'POST',
            path: (itm.subscribed ? '/unsubscribe' : '/subscribe'),
            data: {
              // this is horrible
              channelId: itm.url.split('/')[2]
            }
          })
          itm.subscribed = !itm.subscribed
        }
        return itm
      }), 6)
    }
  },
  mounted () {
    this.loadData()
  }
}
</script>
