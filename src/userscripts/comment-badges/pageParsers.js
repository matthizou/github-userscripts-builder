/**
 * Extract the count data from the HTML string representation of the page
 * Notes: We may, in the future use the Github Rest/GraphQL Api to get those counts.
 * It comes with its own overheads (such as providing an authentication token, instable API, etc.),
 * and I find that for non-intensive queries such as here, scraping the HTML is more versatile and robust.
 * */
export function parseListPageHTML(pageHtml) {
    const rowsInfo = []
    let startSearchIndex
    let rowHtml
    let rowInfo
    let comment
    let htmlLength

    const results = {}
    const rowRegex = /id="issue_([0-9]+)/g
    const commentRegex = /aria-label="([0-9]+) comment[s]?"/

    // Find start of PR rows
    let match = rowRegex.exec(pageHtml)
    while (match !== null) {
        rowsInfo.push({ id: match[1], index: match.index })
        match = rowRegex.exec(pageHtml)
    }

    // Get count
    for (let i = 0; i < rowsInfo.length; i += 1) {
        rowInfo = rowsInfo[i]
        startSearchIndex = rowInfo.index
        htmlLength =
            i === rowsInfo.length - 1
                ? undefined
                : rowsInfo[i + 1].index - startSearchIndex
        rowHtml = pageHtml.substr(startSearchIndex, htmlLength)
        comment = commentRegex.exec(rowHtml)
        results[rowInfo.id] = comment ? parseInt(comment[1], 10) : 0
    }

    return results
}
