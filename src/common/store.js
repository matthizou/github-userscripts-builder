import { getInfoFromUrl } from './utils'

/** Get data from data store. Simple wrapper to ensure an object is returned */
export async function getStoreData(key) {
    const data = await GM.getValue(key)
    return data || {}
}

export async function getRepoData() {
    const { repoOwner, repo } = getInfoFromUrl()
    const key = `${repoOwner}/${repo}`
    return getStoreData(key)
}

export async function setRepoData(data) {
    const { repoOwner, repo } = getInfoFromUrl()
    const key = `${repoOwner}/${repo}`
    return GM.setValue(key, data)
}
