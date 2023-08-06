import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function withAuth(WrappedComponent) {
  return (props) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
      if (!token) {
        navigate("/login");
      }
    }, [token, navigate]); // Depend on token and navigate

    if (!token) {
      return null; // Don't render WrappedComponent until we're sure the user is authenticated
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAuth;
