import tinykeys from 'tinykeys'

export function setupKeybindings (el, bindings, ...extra) {
  const newBindings = {}
  for (const [k, f] of Object.entries(bindings)) {
    newBindings[k] = (ev, ...args) => {
      const active = ev.target
      const enteringText = active instanceof HTMLElement &&
        (active.isContentEditable ||
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT'
        )
      if (!enteringText) return f(ev, ...args)
    }
  }

  return tinykeys(el, newBindings, ...extra)
}
