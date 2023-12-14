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
    },

    isWebglSupported() {
      if (window.WebGLRenderingContext) {
        const canvas = document.createElement('canvas');
        try {
          // Note that { failIfMajorPerformanceCaveat: true } can be passed as a second argument
          // to canvas.getContext(), causing the check to fail if hardware rendering is not available. See
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
          // for more details.
          const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
          if (context && typeof context.getParameter == 'function') {
            return true;
          }
        } catch (e) {
          // WebGL is supported, but disabled
        }
        return false;
      }
      // WebGL not supported
      return false;
    },
    
    showInputError(v$: any, inputName: string): string {
      if(v$[inputName]?.$errors.length > 0) {
        return v$[inputName]?.$errors.map((e: any) => e.$message).join('.&nbsp;')
      }
      return ''
    },

    mergeArrays(a: any, b: any, predicate = (a: any, b: any) => a === b) {
      const c = [...a]; // copy to avoid side effects
      // add all items from B to copy C if they're not already present
      b.forEach((bItem: any) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
      return c;
    }
  }
}
