import { waitFor } from './utils'

const PROCESSED_FLAG = 'comment_badges_extension_flag'

export function markElement(element) {
    element.dataset[PROCESSED_FLAG] = true // eslint-disable-line
}

export function isMarked(element) {
    return element.dataset[PROCESSED_FLAG]
}

export async function waitForUnmarkedElement(selector, options = {}) {
    return waitFor(selector, {
        ...options,
        condition: element => !isMarked(element),
    })
}
