import React, { useState, useContext, useEffect } from 'react'
export const store = {
	state: {
		user: {
			name: 'jet',
			age: 18,
		},
		group: { name: '学习redux' },
	},
	setState: (newState) => {
		// console.log(newState)
		store.state = newState
		store.listeners.map((fn) => fn(store.state))
	},
	listeners: [],
	subscribe: (fn) => {
		store.listeners.push(fn)
		return () => {
			const index = store.listeners.indexOf(fn)
			store.listeners.splice(index, 1)
		}
	},
}

const reducer = (state, { type, payload }) => {
	if (type === 'updateUser') {
		return {
			...state,
			user: {
				...state.user,
				...payload,
			},
		}
	} else {
		return state
	}
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

export const connect = (selector) => (Component) => {
	return (props) => {
		const { state, setState } = useContext(appContext)
		const [, setRender] = useState({})
		const data = selector ? selector(state) : { state }
		useEffect(() => {
      return store.subscribe(() => {
        const newData = selector ? selector(store.state) : { state: store.state }
        if (isChanged(data, newData)) {
          setRender({})
        }
			})
		}, [selector])
		const dispatch = (action) => {
			setState(reducer(state, action))
		}
		return <Component {...props} {...data} dispatch={dispatch} />
	}
}

export const appContext = React.createContext(null)
