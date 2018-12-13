import { getInfoFromUrl } from './utils'

/** Check page url and returns whether or not we are in a list page (pull request/issues lists ) */
export function isListPage() {
  const { section, itemId } = getInfoFromUrl()
  return section === 'pulls' || (section === 'issues' && !itemId)
}

/** Check current url and returns whether or not we are in a list page (pull request/issues lists ) */
export function isDetailsPage() {
  const { section, itemId } = getInfoFromUrl()
  return section === 'pull' || (section === 'issues' && itemId)
}
