import React from 'react'
import { Provider, createStore, connect } from './redux'
import { connectToUser } from './connecters/connectToUser'
import './App.css'

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

const initState = {
	user: {
		name: 'jet',
		age: 18,
	},
	group: { name: '学习redux' },
}

const store = createStore(initState, reducer)

function App() {
	return (
		<Provider store={store}>
			<One />
			<Two />
			<Three />
		</Provider>
	)
}

const One = () => (
	<section>
		One
		<User />
	</section>
)
const Two = () => (
	<section>
		Two
		<UserModify>
			<User />
		</UserModify>
	</section>
)
const Three = connect((state) => {
	return {
		group: state.group,
	}
})(({ group }) => <section>Three{group.name}</section>)

const ajax = async () => {
	return new Promise((res, rej) => {
		setTimeout(() => {
      res({
        data: {
          name: '2s后的数据'
      }})
		}, 2000)
	})
}

const User = connectToUser(({ user }) => {
	return <div>User:{user.name}</div>
})

const fetchUser = (dispatch) => {
  dispatch({type:'updateUser',payload:ajax().then(res => res.data)})
}

const UserModify = connect(
	null,
	null
)(({ state, dispatch }) => {
	const onClick = (e) => {
    // dispatch({ type: 'updateUser', payload: ajax().then(res => res.data) })
    dispatch(fetchUser)
	}
	return (
		<div>
			{state.user.name}
			<br />
			<button onClick={onClick}>点击获取数据</button>
		</div>
	)
})

export default App
