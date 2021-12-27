<template>
    <div>
        <span v-for="(segment, segmentCounter) in interpretedSegments" :key="segmentCounter">
            <span v-if="segment.t === 'H'" v-html="segment.html" />
            <br v-if="segment.t === 'N'" />
            <a style="cursor: pointer;" @click="$emit('timeSegmentClick', segment.seconds)" v-if="segment.t === 'T'">
                {{ segment.text }}
            </a>
        </span>
    </div>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'

const SEPARATOR_REGEX = /((?:[0-5]?[0-9]:)?(?:[0-5]?[0-9]):(?:[0-5][0-9])|(?:<br\s*?>|\n))/gm
const TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/

// I'm sorry for doing this
export default {
	name: 'YouTubeMarkupInterpreter',
	props: ['text'],
	data: () => ({
		interpreted: false
	}),
	computed: {
		interpretedSegments () {
			const splitTxt = this.text.split(SEPARATOR_REGEX)
			const segments = []

			// At some point we'll need a parser-lexer for this
			for (const textSegment of splitTxt) {
				if (textSegment === '\n' || /* repent for your sins */ textSegment.startsWith('<br')) {
					segments.push({
						t: 'N' // Newline
					})
				} else if (TIMESTAMP_REGEX.test(textSegment)) {
					// Double execution similar in kind, don't have a ergonomic way to store the match
					const match = TIMESTAMP_REGEX.exec(textSegment)
					TIMESTAMP_REGEX.lastIndex = 0

					const hours = match[1] != null ? Number(match[1]) : 0
					const minutes = match[2] != null ? Number(match[2]) : 0
					const seconds = match[3] != null ? Number(match[3]) : 0

					segments.push({
						t: 'T',
						text: textSegment,
						seconds: (((hours * 60) + minutes) * 60) + seconds
					})
					// eslint-disable-next-line no-empty
				} else if (textSegment === '') {
				} else {
					segments.push({
						t: 'H',
						html: LibPiped.purifyHTML(textSegment)
							.replaceAll('http://www.youtube.com', '')
							.replaceAll('https://www.youtube.com', '')
					})
				}
			}

			return segments
		}
	}
}
</script>
