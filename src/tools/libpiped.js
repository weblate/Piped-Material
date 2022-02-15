import DOMPurify from 'dompurify'
import formatDuration from 'format-duration'

class LibPiped {
	pad (num, size) {
		return ('000' + num).slice(size * -1)
	}

	timeFormat (durationInSeconds) {
		return formatDuration(durationInSeconds * 1000)
	}

	purifyHTML (original) {
		return DOMPurify.sanitize(original)
	}

	determineVideoIdFromPath (path) {
		const loc = new URL(path, 'http://localhost')
		return loc.searchParams.get('v')
	}

	determineVideoIdFromChannelURL (path) {
		const pathParts = path.split('/')
		return pathParts[2]
	}
}

const lp = new LibPiped()
export { lp as LibPiped }
