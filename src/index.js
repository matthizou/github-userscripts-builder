import { applyExtension, fetchCountData } from './userscripts/comment-badges/core'
import { isListPage } from './common/sections'
// -------------------
// STARTUP BLOCK
// -------------------

// Process page
applyExtension()

// Ensure we rerun the page transform code when the route changes.
const pushState = history.pushState
history.pushState = function() {
  pushState.apply(history, arguments)
  applyExtension()
}

// Handle browser navigation changes (previous/forward button)
window.onpopstate = function(event) {
  if (isListPage()) {
    fetchCountData()
    if (!refreshIntervalId) {
      refreshIntervalId = setInterval(fetchCountData, REFRESH_INTERVAL_PERIOD)
    }
  }
}
