import { waitFor } from './utils'

export function markElement(element, marker) {
    if (!marker) throw new Error('Marker is required!')
    element.dataset[marker] = true // eslint-disable-line
}

export function isMarked(element, marker) {
    return !!element.dataset[marker]
}

export async function waitForUnmarkedElement(selector, marker, options = {}) {
    return waitFor(selector, {
        ...options,
        condition: element => !isMarked(element, marker),
    })
}
