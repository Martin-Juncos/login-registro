import axios from "axios";
import { useState } from "react";

// eslint-disable-next-line react/prop-types
const Register = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/register",
        form
      );
      const token = await response.data.token;
      if (token) {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
      } else {
        console.error("Token no encontrado en la respuesta.");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
    }
  };

  return (
    <div>
      <h3>Registro</h3>
      <input name="name" placeholder="Nombre" onChange={handleChange} />
      <input name="username" placeholder="username" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        onChange={handleChange}
      />
      <button onClick={handleRegister}>Registrarse</button>
    </div>
  );
};

export default Register;
