import { REFRESH_INTERVAL_PERIOD } from './config'
import { markElement, waitForUnmarkedElement } from '../../common/markers'
import { parseListPageHTML } from './pageParsers'
import {
    getInfoFromUrl,
    insertAfter,
    getStoreData,
    $,
} from '../../common/utils'
import { isDetailsPage, isListPage } from '../../common/sections'

console.log('Starting extension: Github comment Badges')

/** Fetch counts info from the server and update the list page */
export function fetchCountData() {
    const url = window.location.href
    GM.xmlHttpRequest({
        method: 'GET',
        url,
        onload: response => {
            const newCountData = parseListPageHTML(response.responseText)
            processListPage(newCountData)
        },
    })
}

/**
 * Processing function for the list pages.
 * Compare displayed count data to stored count data, adding badges and extra styling to the comments container of each row.
 * @params {Object} fetchedData - Optional. Fresh data from the server.
 */
async function processListPage(fetchedData) {
    const repoData = await getRepoData()
    const dataToUpdate = {}

    $('.repository-content [data-id]').forEach(row => {
        const pullRequestId = row.id.replace('issue_', '')
        const icon = row.querySelector('.octicon-comment')

        let container
        let displayedMessageCount
        if (icon) {
            container = icon.parentNode
            displayedMessageCount = parseInt(container.innerText, 10) // todo : WEAK. Use aria-label instead
        } else {
            container = row.querySelector('.float-right .float-right')
            displayedMessageCount = 0
        }

        const countFromServer =
            fetchedData && fetchedData[pullRequestId] >= 0
                ? fetchedData[pullRequestId]
                : undefined
        const messageCount =
            countFromServer !== undefined
                ? countFromServer
                : displayedMessageCount

        if (displayedMessageCount !== messageCount) {
            // The displayed count is outdated, update it
            if (messageCount === 0) {
                // The count has decreased to 0, remove icon
                container.innerHTML = ''
            } else if (displayedMessageCount === 0) {
                // We need to add the icon
                container.innerHTML = `
<a href="/facebook/react/pull/14301" class="muted-link" aria-label="${messageCount} comments" style="position: relative;">
<svg class="octicon octicon-comment v-align-middle" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M14 1H2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2v3.5L7.5 11H14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 9H7l-2 2v-2H2V2h12v8z"></path></svg><i data-id="unread-notification" style="position: absolute; z-index: 2; border-radius: 50%; color: rgb(255, 255, 255); width: 8px; height: 8px; top: 0px; left: 9px; border-width: 0px; background-image: linear-gradient(rgb(187, 187, 187), rgb(204, 204, 204));"></i>
<span class="text-small text-bold">${messageCount}</span>
</a>
`
            } else {
                // The icon exists - simply update text
                container.querySelector('span').innerText = messageCount // todo: look for a more robust way
            }
        }

        const storedMessageCount = repoData[pullRequestId]

        if (storedMessageCount && messageCount < displayedMessageCount) {
            // The count decreased
            // Stored data needs to be updated in certain cases, otherwise an new incoming comment may not be notified
            dataToUpdate[pullRequestId] = messageCount
        }

        if (storedMessageCount === undefined) {
            // The user has never looked at this PR
            if (container) {
                toggleUnreadStyle(container, true)
                toggleMessageNotificationIcon({
                    container,
                    isMuted: true,
                })
            }
        } else {
            toggleUnreadStyle(container, false)
            if (messageCount > storedMessageCount) {
                // This PR has new messages
                toggleMessageNotificationIcon({
                    show: true,
                    container,
                    highlight: messageCount - storedMessageCount >= 5,
                })
            } else if (messageCount > 0) {
                // This PR has no new messages
                toggleMessageNotificationIcon({
                    container,
                    show: false,
                })
            }
        }
    })

    if (Object.keys(dataToUpdate).length) {
        setRepoData({ ...repoData, ...dataToUpdate })
    }
}

/**
 * Processing function for the detail pages.
 * Looks for the count number and stores it
 */
async function processDetailsPage() {
    const repoData = await getRepoData()
    const { section, itemId } = getInfoFromUrl()

    let text
    let messageCount

    if (section === 'pull') {
        text = document.querySelector('#conversation_tab_counter').innerText
        messageCount = parseInt(text, 10)
    } else if (section === 'issues') {
        text = $('a.author')
            .map(x => x.parentNode.innerText)
            .find(x => x.indexOf('comment') > 0)
        text = /([0-9]+) comment/.exec(text)[1] // eslint-disable-line prefer-destructuring
        messageCount = parseInt(text, 10)
    }

    // Compare current number of messages in the PR to the one stored from the last visit
    // Update it if they don't match
    if (Number.isInteger(messageCount)) {
        const previousMessageCount = repoData[itemId]
        if (messageCount !== previousMessageCount) {
            setRepoData({ ...repoData, [itemId]: messageCount })
        }
    }
}

const selectorEnum = {
    LIST: '#js-issues-toolbar',
    DETAILS: '#discussion_bucket',
}

let refreshIntervalId

export async function applyExtension() {
    // Element that signals that we are on such or such page
    let landmarkElement
    if (isListPage()) {
        landmarkElement = await waitForUnmarkedElement(selectorEnum.LIST)
        markElement(landmarkElement)
        processListPage()
        if (!refreshIntervalId) {
            refreshIntervalId = setInterval(
                fetchCountData,
                REFRESH_INTERVAL_PERIOD,
            )
        }
    } else if (isDetailsPage()) {
        landmarkElement = await waitForUnmarkedElement(selectorEnum.DETAILS, {
            priority: 'low',
        })
        markElement(landmarkElement)
        processDetailsPage()
        clearInterval(refreshIntervalId)
        refreshIntervalId = null
    } else {
        clearInterval(refreshIntervalId)
        refreshIntervalId = null
    }
}

function toggleUnreadStyle(container, isUnread) {
    const unreadColor = '#c6cad0'
    if (isUnread) {
        container.style.setProperty('color', unreadColor, 'important')
    } else {
        container.style.removeProperty('color')
    }
}

function toggleMessageNotificationIcon({
    container,
    highlight,
    isMuted = false,
    show = true,
}) {
    const icon = container && container.querySelector('svg')
    if (!icon) {
        return
    }
    let notification = container.querySelector(
        '[data-id="unread-notification"]',
    )

    if (show) {
        if (!notification) {
            container.style.position = 'relative' // eslint-disable-line no-param-reassign
            // Create element for notification
            notification = document.createElement('i')
            notification.dataset.id = 'unread-notification'
            notification.style.position = 'absolute'
            notification.style.zIndex = 2
            notification.style.borderRadius = '50%'
            notification.style.color = '#fff'
            notification.style.width = '8px'
            notification.style.height = '8px'
            notification.style.top = '0px'
            notification.style.left = '9px'
            notification.style.borderWidth = 0
            // Add it to the DOM
            insertAfter(notification, icon)
        }
        if (isMuted) {
            notification.style.backgroundImage = 'linear-gradient(#CCC,#CCC)' // Grey
        } else {
            notification.style.backgroundImage = highlight
                ? 'linear-gradient(#d73a49, #cb2431)' // Red/orange
                : 'linear-gradient(#54a3ff,#006eed)' // Blue
        }
    } else if (notification) {
        // Don't show notification
        // Remove existing element
        container.removeChild(notification)
    }
}

async function getRepoData() {
    const key = getDataKey()
    return getStoreData(key)
}

async function setRepoData(data) {
    const key = getDataKey()
    return GM.setValue(key, data)
}

function getDataKey() {
    const { repoOwner, repo } = getInfoFromUrl()
    return `${repoOwner}/${repo}`
}
