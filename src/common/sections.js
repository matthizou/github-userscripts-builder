import { getInfoFromUrl } from './utils'
import { markElement, waitForUnmarkedElement } from './markers'

export const GITHUB_PAGES_TESTER = {
    PR_LIST: ({ section }) => section === 'pulls',
    PR_DETAILS: ({ section }) => section === 'pull',
    ISSUE_LIST: ({ section, itemId }) => section === 'issues' && !itemId,
    ISSUE_DETAILS: ({ section, itemId }) => section === 'issues' && itemId,
}

export function getCurrentPageId() {
    const pageInfo = getInfoFromUrl()
    const keyValueResult = Object.entries(GITHUB_PAGES_TESTER).find(
        ([, tester]) => tester(pageInfo),
    )
    return keyValueResult ? keyValueResult[0] : null
    // const pageId = pagesToWatch.find(id => GITHUB_PAGES_TESTER[id]())
}

const selectorEnum = {
    PR_LIST: '#js-issues-toolbar',
    ISSUES_LIST: '#js-issues-toolbar',
    PR_DETAILS: '#discussion_bucket',
    ISSUE_DETAILS: '#discussion_bucket',
}

// Function applied when the URL changed
export async function waitForPageToLoad() {
    const pageId = getCurrentPageId()
    if (pageId) {
        // At least one script cares about this page
        // Wait for the page to be loaded, by waiting for a specific element
        const marker = 'some_marker'
        // Element that signals that we are on such or such page
        const landmarkElement = await waitForUnmarkedElement(
            selectorEnum[pageId],
            marker,
        )
        markElement(landmarkElement, marker)
    } else {
        // No script cares about this page
        console.log('No one gives a shit about this page')
    }
    return pageId
}
