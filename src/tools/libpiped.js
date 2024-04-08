import DOMPurify from 'dompurify'
import { parseInline } from 'marked'

class LibPiped {
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

	markdown2HTML (data) {
		if (data == null) {
			return ''
		}
		return parseInline(data, {
			breaks: true,
			mangle: false,
			headerIds: false
		})
	}
}

const lp = new LibPiped()
export { lp as LibPiped }
