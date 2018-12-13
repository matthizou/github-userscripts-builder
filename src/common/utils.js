/** Breakdown Github's URL into data */
export function getInfoFromUrl() {
    const [repoOwner, repo, section, itemId] = window.location.pathname
        .substr(1)
        .split('/')
    return {
        repoOwner,
        repo,
        section,
        itemId,
    }
}

/** Get data from data store */
export async function getStoreData(namespace) {
    const data = await GM.getValue(namespace)
    return data || {}
}

/** Shorthand for querySelectorAll, JQuery style */
export function $(selector, element = document) {
    return Array.from(element.querySelectorAll(selector))
}

/** Insert in DOM the specified node right after the specified reference node */
export function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

/**
 * Wait for an element to appear in document. When not found, wait a bit, and tries again,
 * until the maximum waiting time is reached.
 * @return {Promise}
 */
export function waitFor(selector, options = {}) {
    const { priority = 'medium', condition, maxTime = 20000 } = options

    let intervalPeriod
    switch (priority) {
        case 'low':
            intervalPeriod = 500
            break
        case 'high':
            intervalPeriod = 50
            break
        default:
            intervalPeriod = 200
            break
    }
    const maxRetries = Math.floor(maxTime / intervalPeriod)
    let iterationCount = 0

    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector)
            iterationCount += 1
            if (element && (!condition || condition(element))) {
                clearInterval(interval)
                resolve(element)
            } else if (iterationCount > maxRetries) {
                // End of cycle with failure.
                clearInterval(interval)
                reject(
                    new Error(
                        "Github PR extension error: timeout, couldn't find element",
                    ),
                )
            }
        }, intervalPeriod)
    })
}
