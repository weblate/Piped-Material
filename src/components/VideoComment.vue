<template>
  <v-row align="center" justify="center" no-gutters>
    <v-col cols="4" md="1">
      <v-avatar size="90%" class="mx-3">
        <v-img :src="comment.thumbnail" />
      </v-avatar>
    </v-col>
    <v-col cols="12" md="11">
      <v-card-text>
        <v-icon v-if="comment.pinned" class="mx-2">mdi-pin</v-icon>
        <router-link :to="comment.commentorUrl" class="text-decoration-none black--text">
          <b>{{ comment.author }}</b><v-icon v-if="comment.verified">mdi-account-check</v-icon>
        </router-link>

        <div v-html="renderedCommentTxt" />

        <v-divider class="my-2" />

        <v-icon>mdi-thumb-up</v-icon> {{ numberFormat(comment.likeCount) }}
        <v-icon v-if="comment.hearted" class="ml-4">mdi-heart</v-icon>
        <br />
        <v-btn class="mt-1" text :loading="requestInProgress" :disabled="requestInProgress" @click="loadReplies" v-if="!subComment && childComments.length === 0">Load Replies</v-btn>
        <div v-else-if="!subComment">
          <v-btn text @click="showChildComments = !showChildComments">{{ showChildComments ? 'Hide' : 'Show' }} Replies</v-btn>
        </div>
        <div v-if="childComments.length !== 0 && showChildComments">
          <video-comment :comment="childComment" :video="video" :sub-comment="true" v-for="(childComment) in childComments" :key="childComment.commentId" />
        </div>
      </v-card-text>
    </v-col>
  </v-row>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'
import marked from 'marked'

export default {
  name: 'VideoComment',
  props: ['comment', 'video', 'subComment'],
  data: () => ({
    requestInProgress: false,
    showChildComments: true,
    childComments: []
  }),
  methods: {
    numberFormat (...args) {
      return LibPiped.numberFormat(...args)
    },
    async loadReplies () {
      let nextpage = null
      this.requestInProgress = true

      while (true) {
        const replies = await this.$store.dispatch('auth/makeRequest', {
          method: 'GET',
          path: '/nextpage/comments/' + this.video.videoId,
          params: {
            nextpage: nextpage || this.comment.repliesPage
          }
        })

        this.childComments = this.childComments.concat(replies.comments)
        if (replies.nextpage) {
          nextpage = replies.nextpage
        } else {
          break
        }
      }
      this.requestInProgress = false
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
