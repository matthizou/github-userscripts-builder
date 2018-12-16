import { getRepoData, setRepoData } from '../../../common/store'
import { $, getInfoFromUrl } from '../../../common/utils'

/**
 * Processing function for the detail pages.
 * Looks for the count number and stores it
 */
export async function process() {
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
