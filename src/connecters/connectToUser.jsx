import {connect} from '../redux'

const userSelector = state => {
  return {user: state.user}
}

const userDispatch = (dispatch) => {
	return {
		updateUser: (param) => dispatch({ type: 'updateUser', payload: param }),
	}
}

export const connectToUser = connect(userSelector,userDispatch)

