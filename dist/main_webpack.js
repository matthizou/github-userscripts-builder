/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/core.js":
/*!*********************!*\
  !*** ./src/core.js ***!
  \*********************/
/*! exports provided: fetchCountData, applyExtension, isListPage, isDetailsPage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"fetchCountData\", function() { return fetchCountData; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"applyExtension\", function() { return applyExtension; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isListPage\", function() { return isListPage; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isDetailsPage\", function() { return isDetailsPage; });\n/* harmony import */ var _markers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./markers */ \"./src/markers.js\");\n/* harmony import */ var _pageParsers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pageParsers */ \"./src/pageParsers.js\");\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ \"./src/utils.js\");\n// ==UserScript==\n// @name         Github comment badges\n// @namespace    https://github.com/matthizou\n// @version      1.1\n// @description  Add badges to comment icons in PR list. Periodically and transparently refreshes those badges\n// @author       Matt\n// @match        https://github.com/*\n// @match        https://source.xing.com/*\n// @grant        GM.getValue\n// @grant        GM.setValue\n// @grant        GM.xmlHttpRequest\n\n// ==/UserScript==\n// import { waitFor  } from './utils'\n\n\n\n\n// ;('use strict')\nconsole.log('Starting extension: Github comment Badges')\n\n// Change this value to poll more often\nconst REFRESH_INTERVAL_PERIOD = 90000\n\n// -------------------\n// MAIN LOGIC FUNCTIONS\n// -------------------\n\n/** Fetch counts info from the server and update the list page */\nfunction fetchCountData() {\n    const url = window.location.href\n    GM.xmlHttpRequest({\n        method: 'GET',\n        url,\n        onload: response => {\n            const newCountData = Object(_pageParsers__WEBPACK_IMPORTED_MODULE_1__[\"parseListPageHTML\"])(response.responseText)\n            processListPage(newCountData)\n        },\n    })\n}\n\n/**\n * Processing function for the list pages.\n * Compare displayed count data to stored count data, adding badges and extra styling to the comments container of each row.\n * @params {Object} fetchedData - Optional. Fresh data from the server.\n */\nasync function processListPage(fetchedData) {\n    const repoData = await getRepoData()\n    const dataToUpdate = {}\n\n    Object(_utils__WEBPACK_IMPORTED_MODULE_2__[\"$\"])('.repository-content [data-id]').forEach(row => {\n        const pullRequestId = row.id.replace('issue_', '')\n        const icon = row.querySelector('.octicon-comment')\n\n        let container\n        let displayedMessageCount\n        if (icon) {\n            container = icon.parentNode\n            displayedMessageCount = parseInt(container.innerText, 10) // todo : WEAK. Use aria-label instead\n        } else {\n            container = row.querySelector('.float-right .float-right')\n            displayedMessageCount = 0\n        }\n\n        const countFromServer =\n            fetchedData && fetchedData[pullRequestId] >= 0 ? fetchedData[pullRequestId] : undefined\n        const messageCount = countFromServer !== undefined ? countFromServer : displayedMessageCount\n\n        if (displayedMessageCount !== messageCount) {\n            // The displayed count is outdated, update it\n            if (messageCount === 0) {\n                // The count has decreased to 0, remove icon\n                container.innerHTML = ''\n            } else if (displayedMessageCount === 0) {\n                // We need to add the icon\n                container.innerHTML = `\n<a href=\"/facebook/react/pull/14301\" class=\"muted-link\" aria-label=\"${messageCount} comments\" style=\"position: relative;\">\n<svg class=\"octicon octicon-comment v-align-middle\" viewBox=\"0 0 16 16\" version=\"1.1\" width=\"16\" height=\"16\" aria-hidden=\"true\"><path fill-rule=\"evenodd\" d=\"M14 1H2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2v3.5L7.5 11H14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 9H7l-2 2v-2H2V2h12v8z\"></path></svg><i data-id=\"unread-notification\" style=\"position: absolute; z-index: 2; border-radius: 50%; color: rgb(255, 255, 255); width: 8px; height: 8px; top: 0px; left: 9px; border-width: 0px; background-image: linear-gradient(rgb(187, 187, 187), rgb(204, 204, 204));\"></i>\n<span class=\"text-small text-bold\">${messageCount}</span>\n</a>\n`\n            } else {\n                // The icon exists - simply update text\n                container.querySelector('span').innerText = messageCount // todo: look for a more robust way\n            }\n        }\n\n        const storedMessageCount = repoData[pullRequestId]\n\n        if (storedMessageCount && messageCount < displayedMessageCount) {\n            // The count decreased\n            // Stored data needs to be updated in certain cases, otherwise an new incoming comment may not be notified\n            dataToUpdate[pullRequestId] = messageCount\n        }\n\n        if (storedMessageCount === undefined) {\n            // The user has never looked at this PR\n            if (container) {\n                toggleUnreadStyle(container, true)\n                toggleMessageNotificationIcon({\n                    container,\n                    isMuted: true,\n                })\n            }\n        } else {\n            toggleUnreadStyle(container, false)\n            if (messageCount > storedMessageCount) {\n                // This PR has new messages\n                toggleMessageNotificationIcon({\n                    show: true,\n                    container,\n                    highlight: messageCount - storedMessageCount >= 5,\n                })\n            } else if (messageCount > 0) {\n                // This PR has no new messages\n                toggleMessageNotificationIcon({\n                    container,\n                    show: false,\n                })\n            }\n        }\n    })\n\n    if (Object.keys(dataToUpdate).length) {\n        setRepoData({ ...repoData, ...dataToUpdate })\n    }\n}\n\n/**\n * Processing function for the detail pages.\n * Looks for the count number and stores it\n */\nasync function processDetailsPage() {\n    const repoData = await getRepoData()\n    const { section, itemId } = Object(_utils__WEBPACK_IMPORTED_MODULE_2__[\"getInfoFromUrl\"])()\n\n    let text\n    let messageCount\n\n    if (section === 'pull') {\n        text = document.querySelector('#conversation_tab_counter').innerText\n        messageCount = parseInt(text, 10)\n    } else if (section === 'issues') {\n        text = Object(_utils__WEBPACK_IMPORTED_MODULE_2__[\"$\"])('a.author')\n            .map(x => x.parentNode.innerText)\n            .find(x => x.indexOf('comment') > 0)\n        text = /([0-9]+) comment/.exec(text)[1] // eslint-disable-line prefer-destructuring\n        messageCount = parseInt(text, 10)\n    }\n\n    // Compare current number of messages in the PR to the one stored from the last visit\n    // Update it if they don't match\n    if (Number.isInteger(messageCount)) {\n        const previousMessageCount = repoData[itemId]\n        if (messageCount !== previousMessageCount) {\n            setRepoData({ ...repoData, [itemId]: messageCount })\n        }\n    }\n}\n\nconst selectorEnum = {\n    LIST: '#js-issues-toolbar',\n    DETAILS: '#discussion_bucket',\n}\n\nlet refreshIntervalId\n\nasync function applyExtension() {\n    // Element that signals that we are on such or such page\n    let landmarkElement\n    if (isListPage()) {\n        landmarkElement = await Object(_markers__WEBPACK_IMPORTED_MODULE_0__[\"waitForUnmarkedElement\"])(selectorEnum.LIST)\n        Object(_markers__WEBPACK_IMPORTED_MODULE_0__[\"markElement\"])(landmarkElement)\n        processListPage()\n        if (!refreshIntervalId) {\n            refreshIntervalId = setInterval(fetchCountData, REFRESH_INTERVAL_PERIOD)\n        }\n    } else if (isDetailsPage()) {\n        landmarkElement = await Object(_markers__WEBPACK_IMPORTED_MODULE_0__[\"waitForUnmarkedElement\"])(selectorEnum.DETAILS, {\n            priority: 'low',\n        })\n        Object(_markers__WEBPACK_IMPORTED_MODULE_0__[\"markElement\"])(landmarkElement)\n        processDetailsPage()\n        clearInterval(refreshIntervalId)\n        refreshIntervalId = null\n    } else {\n        clearInterval(refreshIntervalId)\n        refreshIntervalId = null\n    }\n}\n\nfunction toggleUnreadStyle(container, isUnread) {\n    const unreadColor = '#c6cad0'\n    if (isUnread) {\n        container.style.setProperty('color', unreadColor, 'important')\n    } else {\n        container.style.removeProperty('color')\n    }\n}\n\nfunction toggleMessageNotificationIcon({ container, highlight, isMuted = false, show = true }) {\n    const icon = container && container.querySelector('svg')\n    if (!icon) {\n        return\n    }\n    let notification = container.querySelector('[data-id=\"unread-notification\"]')\n\n    if (show) {\n        if (!notification) {\n            container.style.position = 'relative' // eslint-disable-line no-param-reassign\n            // Create element for notification\n            notification = document.createElement('i')\n            notification.dataset.id = 'unread-notification'\n            notification.style.position = 'absolute'\n            notification.style.zIndex = 2\n            notification.style.borderRadius = '50%'\n            notification.style.color = '#fff'\n            notification.style.width = '8px'\n            notification.style.height = '8px'\n            notification.style.top = '0px'\n            notification.style.left = '9px'\n            notification.style.borderWidth = 0\n            // Add it to the DOM\n            Object(_utils__WEBPACK_IMPORTED_MODULE_2__[\"insertAfter\"])(notification, icon)\n        }\n        if (isMuted) {\n            notification.style.backgroundImage = 'linear-gradient(#CCC,#CCC)' // Grey\n        } else {\n            notification.style.backgroundImage = highlight\n                ? 'linear-gradient(#d73a49, #cb2431)' // Red/orange\n                : 'linear-gradient(#54a3ff,#006eed)' // Blue\n        }\n    } else if (notification) {\n        // Don't show notification\n        // Remove existing element\n        container.removeChild(notification)\n    }\n}\n\n/** Check page url and returns whether or not we are in a list page (pull request/issues lists ) */\nfunction isListPage() {\n    const { section, itemId } = Object(_utils__WEBPACK_IMPORTED_MODULE_2__[\"getInfoFromUrl\"])()\n    return section === 'pulls' || (section === 'issues' && !itemId)\n}\n\nfunction isDetailsPage() {\n    const { section, itemId } = Object(_utils__WEBPACK_IMPORTED_MODULE_2__[\"getInfoFromUrl\"])()\n    return section === 'pull' || (section === 'issues' && itemId)\n}\n\nasync function getRepoData() {\n    const key = getDataKey()\n    return Object(_utils__WEBPACK_IMPORTED_MODULE_2__[\"getStoreData\"])(key)\n}\n\nasync function setRepoData(data) {\n    const key = getDataKey()\n    return GM.setValue(key, data)\n}\n\nfunction getDataKey() {\n    const { repoOwner, repo } = Object(_utils__WEBPACK_IMPORTED_MODULE_2__[\"getInfoFromUrl\"])()\n    return `${repoOwner}/${repo}`\n}\n\n\n//# sourceURL=webpack:///./src/core.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core */ \"./src/core.js\");\n\n// -------------------\n// STARTUP BLOCK\n// -------------------\n\n// Process page\nObject(_core__WEBPACK_IMPORTED_MODULE_0__[\"applyExtension\"])()\n\n// Ensure we rerun the page transform code when the route changes\nconst pushState = history.pushState\nhistory.pushState = function() {\n    pushState.apply(history, arguments)\n    Object(_core__WEBPACK_IMPORTED_MODULE_0__[\"applyExtension\"])()\n}\n\n// Handle browser navigation changes (previous/forward button)\nwindow.onpopstate = function(event) {\n    if (Object(_core__WEBPACK_IMPORTED_MODULE_0__[\"isListPage\"])()) {\n        Object(_core__WEBPACK_IMPORTED_MODULE_0__[\"fetchCountData\"])()\n        if (!refreshIntervalId) {\n            refreshIntervalId = setInterval(_core__WEBPACK_IMPORTED_MODULE_0__[\"fetchCountData\"], REFRESH_INTERVAL_PERIOD)\n        }\n    }\n}\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/markers.js":
/*!************************!*\
  !*** ./src/markers.js ***!
  \************************/
/*! exports provided: markElement, isMarked, waitForUnmarkedElement */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"markElement\", function() { return markElement; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isMarked\", function() { return isMarked; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"waitForUnmarkedElement\", function() { return waitForUnmarkedElement; });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./src/utils.js\");\n\n\nconst PROCESSED_FLAG = 'comment_badges_extension_flag'\n\nfunction markElement(element) {\n    element.dataset[PROCESSED_FLAG] = true // eslint-disable-line\n}\n\nfunction isMarked(element) {\n    return element.dataset[PROCESSED_FLAG]\n}\n\nasync function waitForUnmarkedElement(selector, options = {}) {\n    return Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"waitFor\"])(selector, {\n        ...options,\n        condition: element => !isMarked(element),\n    })\n}\n\n\n//# sourceURL=webpack:///./src/markers.js?");

/***/ }),

/***/ "./src/pageParsers.js":
/*!****************************!*\
  !*** ./src/pageParsers.js ***!
  \****************************/
/*! exports provided: parseListPageHTML */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseListPageHTML\", function() { return parseListPageHTML; });\n/**\n * Extract the count data from the HTML string representation of the page\n * Notes: We may, in the future use the Github Rest/GraphQL Api to get those counts.\n * It comes with its own overheads (such as providing an authentication token, instable API, etc.),\n * and I find that for non-intensive queries such as here, scraping the HTML is more versatile and robust.\n * */\nfunction parseListPageHTML(pageHtml) {\n    const rowsInfo = []\n    let startSearchIndex\n    let rowHtml\n    let rowInfo\n    let comment\n    let htmlLength\n\n    const results = {}\n    const rowRegex = /id=\"issue_([0-9]+)/g\n    const commentRegex = /aria-label=\"([0-9]+) comment[s]?\"/\n\n    // Find start of PR rows\n    let match = rowRegex.exec(pageHtml)\n    while (match !== null) {\n        rowsInfo.push({ id: match[1], index: match.index })\n        match = rowRegex.exec(pageHtml)\n    }\n\n    // Get count\n    for (let i = 0; i < rowsInfo.length; i += 1) {\n        rowInfo = rowsInfo[i]\n        startSearchIndex = rowInfo.index\n        htmlLength =\n            i === rowsInfo.length - 1\n                ? undefined\n                : rowsInfo[i + 1].index - startSearchIndex\n        rowHtml = pageHtml.substr(startSearchIndex, htmlLength)\n        comment = commentRegex.exec(rowHtml)\n        results[rowInfo.id] = comment ? parseInt(comment[1], 10) : 0\n    }\n\n    return results\n}\n\n\n//# sourceURL=webpack:///./src/pageParsers.js?");

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! exports provided: getInfoFromUrl, getStoreData, $, insertAfter, waitFor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getInfoFromUrl\", function() { return getInfoFromUrl; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getStoreData\", function() { return getStoreData; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"$\", function() { return $; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"insertAfter\", function() { return insertAfter; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"waitFor\", function() { return waitFor; });\n// ---------------\n// UTIL FUNCTIONS\n// ---------------\n\nfunction getInfoFromUrl() {\n    const [repoOwner, repo, section, itemId] = window.location.pathname\n        .substr(1)\n        .split('/')\n    return {\n        repoOwner,\n        repo,\n        section,\n        itemId,\n    }\n}\n\n/** Get data from data store */\nasync function getStoreData(namespace) {\n    const data = await GM.getValue(namespace)\n    return data || {}\n}\n\n/** Shorthand for querySelectorAll, JQuery style */\nfunction $(selector, element = document) {\n    return Array.from(element.querySelectorAll(selector))\n}\n\n/** Insert in DOM the specified node right after the specified reference node */\nfunction insertAfter(newNode, referenceNode) {\n    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)\n}\n\n/**\n * Wait for an element to appear in document. When not found, wait a bit, and tries again,\n * until the maximum waiting time is reached.\n * @return {Promise}\n */\nfunction waitFor(selector, options = {}) {\n    const { priority = 'medium', condition, maxTime = 20000 } = options\n\n    let intervalPeriod\n    switch (priority) {\n        case 'low':\n            intervalPeriod = 500\n            break\n        case 'high':\n            intervalPeriod = 50\n            break\n        default:\n            intervalPeriod = 200\n            break\n    }\n    const maxRetries = Math.floor(maxTime / intervalPeriod)\n\n    let iterationCount = 0\n\n    return new Promise((resolve, reject) => {\n        const interval = setInterval(() => {\n            const element = document.querySelector(selector)\n            iterationCount += 1\n            if (element && (!condition || condition(element))) {\n                clearInterval(interval)\n                resolve(element)\n            } else if (iterationCount > maxRetries) {\n                // End of cycle with failure.\n                clearInterval(interval)\n                reject(\n                    new Error(\n                        \"Github PR extension error: timeout, couldn't find element\",\n                    ),\n                )\n            }\n        }, intervalPeriod)\n    })\n}\n\n\n//# sourceURL=webpack:///./src/utils.js?");

/***/ })

/******/ });