import { Downloads, Runtime } from 'wxt/browser'

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(handleMessage)
})

const handleMessage = (message: unknown, sender: Runtime.MessageSender) => {
  if (browser.runtime.id !== sender.id) {
    return
  }

  if (
    typeof message !== 'object' ||
    message === null ||
    !('filename' in message) ||
    !('url' in message)
  ) {
    throw new Error('Invalid message')
  }

  const { filename, url } = message
  if (typeof filename !== 'string' || typeof url !== 'string') {
    throw new Error('Not found: filename, url')
  }

  browser.downloads.download({
    filename: `vgm/${filename}`,
    url,
  })
}

// const waitForDownload = (downloadId: number) =>
//   new Promise<void>((resolve, reject) => {
//     const handleChange = async (
//       downloadDelta: Downloads.OnChangedDownloadDeltaType
//     ) => {
//       const { id, state } = downloadDelta
//       if (downloadId !== downloadDelta.id || typeof state === 'undefined') {
//         return
//       }

//       switch (state.current) {
//         case 'interrupted': {
//           const items = await browser.downloads.search({ id })
//           const error = items[0].error ?? 'FAILED'
//           browser.downloads.onChanged.removeListener(handleChange)
//           reject(error)
//         }
//         case 'complete': {
//           browser.downloads.onChanged.removeListener(handleChange)
//           resolve()
//         }
//       }
//     }

//     browser.downloads.onChanged.addListener(handleChange)
//   })
