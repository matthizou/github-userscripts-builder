import { REFRESH_INTERVAL_PERIOD } from './variables'

import { process as processDetailsPage } from './details-page'
import {
    process as processListPage,
    parse as parseListPage,
} from './list-pages'

console.log('Starting extension: Github comment Badges')

export const config = {
    PR_LIST: {
        process: processListPage,
        poll: {
            url: 'self',
            frequency: REFRESH_INTERVAL_PERIOD,
            parse: html => {
                const newCountData = parseListPage(html)
                processListPage(newCountData)
            },
        },
    },
    PR_DETAILS: {
        process: processDetailsPage,
    },
}
