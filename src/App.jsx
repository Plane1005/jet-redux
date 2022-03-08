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

const store = createStore(initState,reducer)

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
		<UserModify>内容</UserModify>
	</section>
)
const Three = connect((state) => {
	return {
		group: state.group,
	}
})(({ group }) => <section>Three{group.name}</section>)

const User = connectToUser(({ user }) => {
	return <div>User:{user.name}</div>
})

const UserModify = connectToUser(({ user, updateUser, children }) => {
	const onChange = (e) => {
		updateUser({ name: e.target.value })
	}
	return (
		<div>
			{children}
			<input type='text' value={user.name} onChange={onChange} />
		</div>
	)
})

export default App
