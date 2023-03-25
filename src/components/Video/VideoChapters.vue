<template>
    <div class="root">
        <v-card v-for="chapter in humanizedChapters" :key="chapter.name" min-height="100%" link @click="$emit('seek', chapter.start)">
            <img :src="chapter.image" />
            <v-card-title style="font-weight: normal; font-size: 1rem;">
                {{ chapter.humanizedStart }}
                <br />
                {{ chapter.title }}
            </v-card-title>
        </v-card>
    </div>
</template>

<script>
export default {
	name: 'VideoChapters',
	props: ['chapters'],
	computed: {
		humanizedChapters () {
			return this.chapters.map(ch => {
				ch.humanizedStart = this.$store.getters['i18n/fmtDuration'](ch.start)
				return ch
			})
		}
	}
}
</script>

<style scoped lang="scss">
.root {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
	flex-shrink: 0;
	overflow-y: scroll;

	> * {
        margin-left: 8px;
        margin-right: 8px;
        margin-bottom: 8px;
	}

    > :first-child {
        margin-left: 0;
    }

    > :last-child {
        margin-right: 0;
    }
}
</style>
