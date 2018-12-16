import { waitForPageToLoad } from './common/sections'
import { getPage } from './common/utils'
import { configs } from './configs'

// const pagesToWatch = configs
//     .reduce((res, config) => res.concat(Object.keys(config)), [])
//     // Remove dupplicated
//     .filter((element, index, array) => array.indexOf(element) === index)

// -------------------
// STARTUP BLOCK
// -------------------

// Ensure we rerun the page transform code when the route changes.
const { pushState } = history
history.pushState = async function customPushState(...args) {
    pushState.apply(history, args)
    // Stop timers and pollers related to previous page
    clearActiveIntervals()

    // Apply extension
    const pageId = await waitForPageToLoad()
    applyScripts(pageId)
}

// Handle browser navigation changes (previous/forward button)
window.onpopstate = function onpopstate() {
    clearActiveIntervals()

    // TODO: restart intervals, do NOT process DOM, do an immediate poll/interval
}

// Store intervals to clear them later
let intervals = []
function clearActiveIntervals() {
    intervals.forEach(intervalId => clearInterval(intervalId))
    intervals = []
}

function applyScripts(pageId) {
    // Get the configs applying to the current page
    const configsForCurrentPage = configs
        .map(config => config[pageId])
        .filter(x => !!x)

    // Start processing and intervals
    configsForCurrentPage.forEach(
        ({ process = Function.prototype, interval }) => {
            process()

            if (interval) {
                const { frequency, callback } = interval
                intervals.push(setInterval(callback, frequency))
            }
        },
    )

    // Start page polling
    startPolling(
        configsForCurrentPage.map(config => config.poll).filter(x => !!x),
    )
}

function startPolling(pollConfigs) {
    // Group similar polls together
    const processedPollConfigs = pollConfigs.reduce((res, pollConfig) => {
        const { url, parse, frequency } = pollConfig
        const existingPoll = res.find(poll => poll.url === url)
        let callbacks = [parse]
        if (existingPoll && existingPoll.frequency === frequency) {
            callbacks = [parse, ...existingPoll.callbacks]
        }
        return [{ ...pollConfig, callbacks }, ...res]
    }, [])

    // Starts polls
    processedPollConfigs.forEach(async pollConfig => {
        const { callbacks, frequency, url } = pollConfig

        intervals.push(
            setTimeout(async () => {
                const response = await getPage(
                    url === 'self' ? window.location.href : url,
                )
                if (response && response.responseText) {
                    callbacks.forEach(callback =>
                        callback(response.responseText),
                    )
                }
            }, frequency),
        )
    })
}

// Process page
waitForPageToLoad().then(pageId => {
    applyScripts(pageId)
})
