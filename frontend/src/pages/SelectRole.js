import { useNavigate } from "react-router-dom";
import "./SelectRole.css";

function SelectRole() {

  const navigate = useNavigate();

  const selectRole = (role) => {

    // Save role temporarily
    localStorage.setItem("selectedRole", role);

    // Go to auth page
    navigate("/auth");
  };

  return (
    <div className="role-container">

      <h1 className="title">Select Your Role</h1>

      <div className="role-box-container">

        <div
          className="role-box user"
          onClick={() => selectRole("user")}
        >
          <h2>User</h2>
          <p>Browse and join events</p>
        </div>

        <div
          className="role-box creator"
          onClick={() => selectRole("creator")}
        >
          <h2>Creator</h2>
          <p>Create and manage events</p>
        </div>

        <div
          className="role-box admin"
          onClick={() => selectRole("admin")}
        >
          <h2>Admin</h2>
          <p>Manage the whole platform</p>
        </div>

      </div>

    </div>
  );
}

export default SelectRole;