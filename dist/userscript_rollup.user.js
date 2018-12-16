// ==UserScript==
// @name         ALPHA - Github Userscript bundle
// @namespace    https://github.com/matthizou
// @version      1.1
// @description  A bundle of goodies
// @author       Matt
// @match        https://github.com/*
// @match        https://source.xing.com/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function () {
    'use strict';

    /* ---------
     * utils.js
     * --------- */

    /** Breakdown Github's URL into data */
    function getInfoFromUrl() {
        const [repoOwner, repo, section, itemId] = window.location.pathname
            .substr(1)
            .split('/');
        return {
            repoOwner,
            repo,
            section,
            itemId,
        }
    }

    async function getPage(url) {
        return new Promise(resolve =>
            GM.xmlHttpRequest({
                method: 'GET',
                url,
                onload: resolve,
            }),
        )
    }

    /**
     * Wait for an element to appear in document. When not found, wait a bit, and tries again,
     * until the maximum waiting time is reached.
     * @return {Promise}
     */
    function waitFor(selector, options = {}) {
        const { priority = 'medium', condition, maxTime = 20000 } = options;

        let intervalPeriod;
        switch (priority) {
            case 'low':
                intervalPeriod = 500;
                break
            case 'high':
                intervalPeriod = 50;
                break
            default:
                intervalPeriod = 200;
                break
        }
        const maxRetries = Math.floor(maxTime / intervalPeriod);
        let iterationCount = 0;

        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                iterationCount += 1;
                if (element && (!condition || condition(element))) {
                    clearInterval(interval);
                    resolve(element);
                } else if (iterationCount > maxRetries) {
                    // End of cycle with failure.
                    clearInterval(interval);
                    reject(
                        new Error(
                            "Github PR extension error: timeout, couldn't find element",
                        ),
                    );
                }
            }, intervalPeriod);
        })
    }

    /* ---------
     * markers.js
     * --------- */

    function markElement(element, marker) {
        if (!marker) throw new Error('Marker is required!')
        element.dataset[marker] = true; // eslint-disable-line
    }

    function isMarked(element, marker) {
        return !!element.dataset[marker]
    }

    async function waitForUnmarkedElement(selector, marker, options = {}) {
        return waitFor(selector, {
            ...options,
            condition: element => !isMarked(element, marker),
        })
    }

    /* ---------
     * sections.js
     * --------- */

    const GITHUB_PAGES_TESTER = {
        PR_LIST: ({ section }) => section === 'pulls',
        PR_DETAILS: ({ section }) => section === 'pull',
        ISSUE_LIST: ({ section, itemId }) => section === 'issues' && !itemId,
        ISSUE_DETAILS: ({ section, itemId }) => section === 'issues' && itemId,
    };

    function getCurrentPageId() {
        const pageInfo = getInfoFromUrl();
        const keyValueResult = Object.entries(GITHUB_PAGES_TESTER).find(
            ([, tester]) => tester(pageInfo),
        );
        return keyValueResult ? keyValueResult[0] : null
        // const pageId = pagesToWatch.find(id => GITHUB_PAGES_TESTER[id]())
    }

    const selectorEnum = {
        PR_LIST: '#js-issues-toolbar',
        ISSUES_LIST: '#js-issues-toolbar',
        PR_DETAILS: '#discussion_bucket',
        ISSUE_DETAILS: '#discussion_bucket',
    };

    // Function applied when the URL changed
    async function waitForPageToLoad() {
        const pageId = getCurrentPageId();
        if (pageId) {
            // At least one script cares about this page
            // Wait for the page to be loaded, by waiting for a specific element
            const marker = 'some_marker';
            // Element that signals that we are on such or such page
            const landmarkElement = await waitForUnmarkedElement(
                selectorEnum[pageId],
                marker,
            );
            markElement(landmarkElement, marker);
        } else {
            // No script cares about this page
            console.log('No one gives a shit about this page');
        }
        return pageId
    }

    /* ---------
     * store.js
     * --------- */

    /* ---------
     * process.js
     * --------- */

    /* ---------
     * parse.js
     * --------- */
    /**
     * Extract the count data from the HTML string representation of the page
     * Notes: We may, in the future use the Github Rest/GraphQL Api to get those counts.
     * It comes with its own overheads (such as providing an authentication token, instable API, etc.),
     * and I find that for non-intensive queries such as here, scraping the HTML is more versatile and robust.
     * */
    function parse(pageHtml) {
        const rowsInfo = [];
        let startSearchIndex;
        let rowHtml;
        let rowInfo;
        let comment;
        let htmlLength;

        const results = {};
        const rowRegex = /id="issue_([0-9]+)/g;
        const commentRegex = /aria-label="([0-9]+) comment[s]?"/;

        // Find start of PR rows
        let match = rowRegex.exec(pageHtml);
        while (match !== null) {
            rowsInfo.push({ id: match[1], index: match.index });
            match = rowRegex.exec(pageHtml);
        }

        // Get count
        for (let i = 0; i < rowsInfo.length; i += 1) {
            rowInfo = rowsInfo[i];
            startSearchIndex = rowInfo.index;
            htmlLength =
                i === rowsInfo.length - 1
                    ? undefined
                    : rowsInfo[i + 1].index - startSearchIndex;
            rowHtml = pageHtml.substr(startSearchIndex, htmlLength);
            comment = commentRegex.exec(rowHtml);
            results[rowInfo.id] = comment ? parseInt(comment[1], 10) : 0;
        }

        return results
    }

    /* ---------
     * configs.js
     * --------- */

    const configs = [
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
                        const results = parse(html);
                        console.log(`from polling: ${JSON.stringify(results)}`);
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
                        );
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
    ];

    // const pagesToWatch = configs
    //     .reduce((res, config) => res.concat(Object.keys(config)), [])
    //     // Remove dupplicated
    //     .filter((element, index, array) => array.indexOf(element) === index)

    // -------------------
    // STARTUP BLOCK
    // -------------------

    // Ensure we rerun the page transform code when the route changes.
    const { pushState } = history;
    history.pushState = async function customPushState(...args) {
        pushState.apply(history, args);
        // Stop timers and pollers related to previous page
        clearActiveIntervals();

        // Apply extension
        const pageId = await waitForPageToLoad();
        applyScripts(pageId);
    };

    // Handle browser navigation changes (previous/forward button)
    window.onpopstate = function onpopstate() {
        clearActiveIntervals();

        // TODO: restart intervals, do NOT process DOM, do an immediate poll/interval
    };

    // Store intervals to clear them later
    let intervals = [];
    function clearActiveIntervals() {
        intervals.forEach(intervalId => clearInterval(intervalId));
        intervals = [];
    }

    function applyScripts(pageId) {
        // Get the configs applying to the current page
        const configsForCurrentPage = configs
            .map(config => config[pageId])
            .filter(x => !!x);

        // Start processing and intervals
        configsForCurrentPage.forEach(
            ({ process = Function.prototype, interval }) => {
                process();

                if (interval) {
                    const { frequency, callback } = interval;
                    intervals.push(setInterval(callback, frequency));
                }
            },
        );

        // Start page polling
        startPolling(
            configsForCurrentPage.map(config => config.poll).filter(x => !!x),
        );
    }

    function startPolling(pollConfigs) {
        // Group similar polls together
        const processedPollConfigs = pollConfigs.reduce((res, pollConfig) => {
            const { url, parse, frequency } = pollConfig;
            const existingPoll = res.find(poll => poll.url === url);
            let callbacks = [parse];
            if (existingPoll && existingPoll.frequency === frequency) {
                callbacks = [parse, ...existingPoll.callbacks];
            }
            return [{ ...pollConfig, callbacks }, ...res]
        }, []);

        // Starts polls
        processedPollConfigs.forEach(async pollConfig => {
            const { callbacks, frequency, url } = pollConfig;

            intervals.push(
                setTimeout(async () => {
                    const response = await getPage(
                        url === 'self' ? window.location.href : url,
                    );
                    if (response && response.responseText) {
                        callbacks.forEach(callback =>
                            callback(response.responseText),
                        );
                    }
                }, frequency),
            );
        });
    }

    // Process page
    waitForPageToLoad().then(pageId => {
        applyScripts(pageId);
    });

}());
