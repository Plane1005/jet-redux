import React, { useState, useEffect } from 'react'

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

const preDispatch2 = dispatch

dispatch = (action) => {
  if (action.payload instanceof Promise) {
		action.payload.then((data) => {
			dispatch({ ...action, payload: data })
		})
	} else {
		preDispatch2(action)
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

export const connect = (stateSelector, dispatchSelector) => (Component) => {
  return (props) => {
		const [, setRender] = useState({})
		const data = stateSelector ? stateSelector(state) : { state }
		const dispatchers = dispatchSelector
			? dispatchSelector(dispatch)
			: { dispatch: dispatch }
		useEffect(() => {
			return store.subscribe(() => {
				const newData = stateSelector ? stateSelector(state) : { state }
				if (isChanged(data, newData)) {
					setRender({})
				}
			})
		}, [stateSelector])
		return <Component {...props} {...data} {...dispatchers} />
	}
}

export const appContext = React.createContext(null)

export const Provider = ({ store, children }) => {
	return <appContext.Provider value={store}>{children}</appContext.Provider>
}
