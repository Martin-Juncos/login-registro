import axios from "axios";
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

// eslint-disable-next-line react/prop-types
const Profile = ({ setIsAuthenticated }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token no encontrado");
        setIsAuthenticated(false);
        return;
      }

      try {
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.id;

        const response = await axios.get(
          `http://localhost:3001/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(response.data.user);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setIsAuthenticated(false);
      }
    };

    fetchProfile();
  }, [setIsAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <div>
      {profile ? (
        <>
          <h3>Perfil de {profile.name}</h3>
          <p>Email: {profile.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Cargando perfil...</p>
      )}
    </div>
  );
};

export default Profile;
