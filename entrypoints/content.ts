export default defineContentScript({
  matches: ['*://downloads.khinsider.com/game-soundtracks/album/*'],
  main: async () => {
    const songList = getSongList()

    for await (const item of songList) {
      browser.runtime.sendMessage(item)
    }
  },
})

const parser = new DOMParser()

const getSongList = async function* () {
  const songListTable = document.querySelector<HTMLTableElement>('#songlist')
  if (songListTable === null) {
    throw new Error('Not found: songlist')
  }

  const rows = Array.from(songListTable.rows).slice(1, -1)

  for (const row of rows) {
    const cells = Array.from(row.cells)
    const texts = cells.map(e => e.textContent)
    if (texts[1] === null || texts[2] === null || texts[3] === null) {
      throw new Error(`Null content: index ${row.rowIndex}`)
    }

    const filename = `${texts[1]}-${texts[2].padStart(3, '0')} ${texts[3]}.mp3`
    const url = await getAudioUrl(row)

    await sleep(1000)

    yield {
      filename,
      url,
    }
  }
}

const getAudioUrl = async (songListRow: HTMLTableRowElement) => {
  const cell = songListRow.cells.item(3)
  if (cell === null) {
    throw new Error('Not found: songlist row anchor cell')
  }

  const anchor = cell.firstChild
  if (!(anchor instanceof HTMLAnchorElement)) {
    throw new Error('Not found: songlist row anchor')
  }

  const res = await fetch(anchor.href)
  if (!res.ok) {
    throw new Error(`Failed fetching the song page: ${res.status}`)
  }

  const dom = parser.parseFromString(await res.text(), 'text/html')
  const audio = dom.querySelector<HTMLAudioElement>('audio')
  if (audio === null) {
    throw new Error('Not found: audio')
  }

  return audio.src

  // const match = /.+\/(?!\/)/.exec(audio.src)
  // if (match === null) {
  //   throw new Error('Not found: base url')
  // }

  // const baseUrl = match[0]
  // return baseUrl
}
