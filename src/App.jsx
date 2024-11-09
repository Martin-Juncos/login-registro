// src/components/App.js
import { useState } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  return (
    <div>
      {isAuthenticated ? (
        <Profile setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <>
          <h2>¿Deseas registrarte o iniciar sesión?</h2>
          <Register setIsAuthenticated={setIsAuthenticated} />
          <Login setIsAuthenticated={setIsAuthenticated} />
        </>
      )}
    </div>
  );
};

export default App;
