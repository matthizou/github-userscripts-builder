import { parse as parseListPageForCounts } from './userscripts/comment-badges/list-pages'

export const configs = [
    {
        PR_LIST: {
            // Function executed when page is loaded
            process: () => console.log('PR_LIST page loaded !'),
            // interval: {
            //     frequency: 2000,
            //     callback: () => console.log('hello from interval'),
            // },
            // Get full page html from server regularly. Group
            poll: {
                url: 'self',
                frequency: 3000,
                // Function
                parse: html => {
                    // console.log(html.responseText.substring(1, 100))
                    const results = parseListPageForCounts(html)
                    console.log(`from polling: ${JSON.stringify(results)}`)
                },
            },
        },
    },
    {
        PR_LIST: {
            poll: {
                url: 'self',
                frequency: 3000,
                // Function
                parse: html => {
                    console.log(
                        `HELLO from 2nd polling ${html.substring(0, 100)}`,
                    )
                },
            },
        },
        PR_DETAILS: {
            // Function executed when page is loaded
            process: () => console.log('PR_DETAILS page loaded !'),
            interval: {
                frequency: 1000,
                callback: () => console.log('hello from other interval'),
            },
        },
    },
]
