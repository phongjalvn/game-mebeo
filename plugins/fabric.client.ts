import fabricBrowser from 'fabric-pure-browser'

import { TFModel, disposeTFVariables } from '../utils/model'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      fabric: fabricBrowser.fabric<fabric>,
      TFModel,
      disposeTFVariables,
    },
  }
})
