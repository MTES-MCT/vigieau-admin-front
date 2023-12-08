export const useUtils = () => {
  return {
    debounce(fn: Function, delay: number) {
      let timeoutID: any = null
      return function() {
        clearTimeout(timeoutID)
        // eslint-disable-next-line prefer-rest-params
        const args = arguments
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this
        timeoutID = setTimeout(function() {
          fn.apply(that, args)
        }, delay)
      }
    }
  }
}
