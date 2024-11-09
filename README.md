Para proporcionar una explicación más detallada, vamos a desglosar el proceso de autenticación usando JWT en una aplicación con backend en Node.js y frontend en React. Incluiré cada parte del código y la explicaré en detalle.

---

## 🗒️ **Explicación Paso a Paso del Código de Autenticación JWT**

### 1. **Backend: Controlador de Registro**

Este controlador gestiona el registro de un nuevo usuario en la base de datos y genera un token JWT para él.

```javascript
// Importaciones de bcrypt para encriptar contraseñas y jwt para generar el token
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User"); // Modelo de usuario de la base de datos

// Función para el registro del usuario
const registerController = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Verifica si el usuario ya existe en la base de datos
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Usuario ya registrado" });
  }

  // 2. Encripta la contraseña proporcionada por el usuario
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Crea y guarda un nuevo usuario con la contraseña encriptada
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  // 4. Genera un token JWT que contiene el ID del usuario, firmado con una clave secreta
  const token = jwt.sign({ id: newUser._id }, "secret_key", {
    expiresIn: "1h",
  });

  // 5. Retorna el token y el usuario recién creado
  res.status(201).json({ token, user: newUser });
};
```

### Explicación del Proceso

- **bcrypt.hash**: encripta la contraseña del usuario, asegurando que incluso si alguien accede a la base de datos, no puede ver la contraseña en texto claro.
- **jwt.sign**: crea un token JWT que contiene el `id` del usuario. Este token permite que el frontend lo utilice para autenticación en futuras solicitudes.

### 2. **Backend: Controlador de Login**

El controlador de login verifica las credenciales y, si son correctas, devuelve un token JWT.

```javascript
const loginController = async (req, res) => {
  const { email, password } = req.body;

  // 1. Verifica si el usuario existe
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Credenciales incorrectas" });
  }

  // 2. Genera un token JWT para el usuario autenticado
  const token = jwt.sign({ id: user._id }, "secret_key", { expiresIn: "1h" });

  // 3. Devuelve el token y la información del usuario
  res.json({ token, user });
};
```

### Explicación del Proceso

- **bcrypt.compare**: compara la contraseña ingresada con la encriptada en la base de datos.
- **jwt.sign**: genera un nuevo token si las credenciales son correctas.

### 3. **Frontend en React: Componente de Login**

El componente de `Login` permite al usuario iniciar sesión, guarda el token en `localStorage`, y actualiza el estado de autenticación.

```javascript
import React, { useState } from "react";
import axios from "axios";

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Realiza la solicitud de login al backend
      const response = await axios.post("/auth/login", { email, password });

      // 2. Guarda el token en localStorage y actualiza el estado
      localStorage.setItem("token", response.data.token);
      setAuth(true); // Cambia el estado de autenticación a `true`
    } catch (error) {
      console.error("Error al iniciar sesión", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
```

### Explicación del Proceso

- **axios.post**: realiza la solicitud al backend para autenticar al usuario.
- **localStorage.setItem**: guarda el token en `localStorage` para que esté disponible en las siguientes solicitudes.

### 4. **Frontend en React: Componente de Perfil**

Este componente de `Profile` muestra los datos del usuario y permite el cierre de sesión.

```javascript
import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";

const Profile = ({ setAuth }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Obtiene el token de `localStorage`
      const token = localStorage.getItem("token");

      if (token) {
        // 2. Decodifica el token para extraer el `id` del usuario
        const decoded = jwt_decode(token);

        // 3. Realiza una solicitud para obtener los datos del perfil
        const response = await axios.get(`/users/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 4. Guarda la información del perfil en el estado
        setProfile(response.data);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    // Elimina el token y cambia el estado de autenticación
    localStorage.removeItem("token");
    setAuth(false);
  };

  return (
    <div>
      {profile ? (
        <>
          <h3>Bienvenido, {profile.name}</h3>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default Profile;
```

### Explicación del Proceso

- **jwt_decode**: decodifica el token para extraer el `id` del usuario sin necesidad de hacer otra solicitud.
- **axios.get**: obtiene los datos del usuario en una ruta protegida mediante el token.
- **localStorage.removeItem**: elimina el token cuando el usuario cierra sesión.

### 5. **Integración en el Componente Principal**

El componente `App` gestiona el estado de autenticación, mostrando `Login` si el usuario no está autenticado y `Profile` si está autenticado.

```javascript
import React, { useState } from "react";
import Login from "./Login";
import Profile from "./Profile";

const App = () => {
  // Verifica si hay un token en `localStorage` para determinar el estado inicial
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem("token") ? true : false
  );

  return (
    <div>
      {isAuth ? <Profile setAuth={setIsAuth} /> : <Login setAuth={setIsAuth} />}
    </div>
  );
};

export default App;
```

### Explicación del Proceso

- El estado de `isAuth` cambia cuando el usuario inicia o cierra sesión, permitiendo que la aplicación muestre las vistas correspondientes.

---

### Conclusión

Este ejemplo detalla cómo realizar un flujo de autenticación completo en una aplicación de React usando JWT. Esta configuración permite que los usuarios accedan a rutas protegidas mientras tienen su sesión iniciada y los desloguea de forma segura al cerrar sesión.


Made by Prof. Martin with a lot of 💖 and ☕
