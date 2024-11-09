import { useState } from "react";
import axios from "axios";

// eslint-disable-next-line react/prop-types
const Login = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        form
      );
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("Usuario no encontrado. Por favor, regístrate.");
      } else {
        alert("El usuario no existe, debe registrarse");
      }
    }
  };

  return (
    <div>
      <h3>Iniciar Sesión</h3>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        onChange={handleChange}
      />
      <button onClick={handleLogin}>Iniciar Sesión</button>
    </div>
  );
};

export default Login;
