import { all, fork } from 'redux-saga/effects';
import { loginFlow } from './login';
//import user from './user';

/**
 * rootSaga
 */
export default function* root() {
  //yield all([fork(github), fork(user)]);
  yield all([fork(loginFlow)]);
}