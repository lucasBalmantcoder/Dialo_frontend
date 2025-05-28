// src/pages/ConfirmEmail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ConfirmEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState("Confirmando...");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function confirm() {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/auth/confirm-email/${token}`);
        setMessage(response.data.message);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError("Erro desconhecido na confirmação.");
        }
      }
    }

    confirm();
  }, [token]);

  return (
    <div style={{ maxWidth: 600, margin: "auto", paddingTop: "2rem" }}>
      <h2>Confirmação de E-mail</h2>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p style={{ color: "green" }}>{message}</p>
      )}
    </div>
  );
}
