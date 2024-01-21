import './App.css';
import { Routes, Route } from "react-router-dom";

import  Login  from './view/pages/Login'
import  NoPage  from './view/pages/NoPage'
import  Home  from './view/pages/Home'
import  PrivateRoute  from './view/routes/PrivateRoute'
import  PublicRoute  from './view/routes/PublicRoute'

export default function App(props) {
  console.log('soter', props)
  return (
      <Routes>
        {
          /*
          <Route path="/" exact element={<Login />} />
          <Route path="login" exact element={<Login />} />
          <Route path = "*" element={<NoPage />} />
          */
          }

          <Route
                element={
                  <PublicRoute isAuthenticated={props.isAuth} to="/private">
                    <NoPage />
                  </PublicRoute>
                }
                path="/"
              />
              <Route
                element={
                  <PrivateRoute isAuthenticated={props.isAuth} to="/">
                    <Login />
                  </PrivateRoute>
                }
                path="/private"
              />
              <Route element={<NoPage />} path="*" />
              <Route element={<Home />} path="/home" />
      </Routes>
  );
}
