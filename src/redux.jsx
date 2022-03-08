import React, { useState, useContext, useEffect } from 'react'

let state = undefined
let reducer = undefined
let listeners = []

const setState = (newState) => {
  // console.log(newState)
  state = newState
  listeners.map((fn) => fn(state))
}
  
const store = {
  getState: () => {
    return state
  },
  dispatch: (action) => {
    setState(reducer(state, action))
  },
	subscribe: (fn) => {
		listeners.push(fn)
		return () => {
			const index = listeners.indexOf(fn)
			listeners.splice(index, 1)
		}
	},
}

let dispatch = store.dispatch

const preDispatch = dispatch

dispatch = (action) => {
  if (action instanceof Function) {
    action(dispatch)
  } else {
    preDispatch(action)
  }
}

export const createStore = (initState, _reducer) => {
	state = initState
  reducer = _reducer
  return store
}

const isChanged = (oldState, newState) => {
	let changed = false
	for (let key in oldState) {
		if (oldState[key] !== newState[key]) {
			changed = true
		}
	}
	return changed
}

export const connect = (selector, dispatchSelector) => (Component) => {
	return (props) => {
		const [, setRender] = useState({})
		const data = selector ? selector(state) : { state }
		const dispatchers = dispatchSelector
			? dispatchSelector(store.dispatch)
			: { dispatch: store.dispatch }
		useEffect(() => {
			return store.subscribe(() => {
				const newData = selector
					? selector(state)
					: { state }
				if (isChanged(data, newData)) {
					setRender({})
				}
			})
		}, [selector])
		return <Component {...props} {...data} {...dispatchers} />
	}
}

export const appContext = React.createContext(null)

export const Provider = ({ store, children }) => {
  return (
    <appContext.Provider value={store}>
      {children}
    </appContext.Provider>
  )
}
