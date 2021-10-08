<template>
  <v-card class="pa-1" outlined>
    <v-row align="center" justify="center">
      <v-col md="1">
        <v-avatar size="96" class="mx-3">
          <v-img :src="comment.thumbnail"></v-img>
        </v-avatar>
      </v-col>
      <v-col md="11">
        <v-card-title class="subtitle-1">
          <v-icon v-if="comment.pinned" class="mx-2">mdi-pin</v-icon>
          <router-link :to="comment.commentorUrl" class="text-decoration-none black--text">
            <b>{{ comment.author }}</b><v-icon v-if="comment.verified">mdi-account-check</v-icon>
          </router-link>
        </v-card-title>
        <v-card-text>
          <div v-html="renderedCommentTxt" />

          <v-divider class="my-2" />

          <v-icon>mdi-thumb-up</v-icon> {{ numberFormat(comment.likeCount) }}
          <v-icon v-if="comment.hearted" class="ml-4">mdi-heart</v-icon>
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'
import marked from 'marked'

export default {
  name: 'VideoComment',
  props: ['comment', 'video'],
  methods: {
    numberFormat (...args) {
      return LibPiped.numberFormat(...args)
    }
  },

  computed: {
    renderedCommentTxt () {
      return LibPiped.purifyHTML(marked.parseInline(this.comment.commentText, {
        breaks: true
      }))
    }
  }
}
</script>
