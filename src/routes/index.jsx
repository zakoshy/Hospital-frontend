import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login/Login";
import Reception from "../pages/Reception/Reception";
import Consultation from "../pages/Consultation/Consultation";
import Department from "../pages/Department/Department";
import Laboratory from "../pages/Laboratory/Laboratory";
import Pharmacy from "../pages/Pharmacy/Pharmacy";
import Payment from "../pages/Payment/Payment";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProtectedRoute from "../utils/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // ✅ Make dashboard public
      {
        index: true,
        element: <Dashboard />,
      },
      { path: "login", element: <Login /> },

      {
        element: <ProtectedRoute allowedRoles={["reception"]} />,
        children: [{ path: "reception", element: <Reception /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={["consultation"]} />,
        children: [{ path: "consultation", element: <Consultation /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={["department"]} />,
        children: [{ path: "department/:name", element: <Department /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={["laboratory"]} />,
        children: [{ path: "laboratory", element: <Laboratory /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={["payment"]} />,
        children: [{ path: "payment", element: <Payment /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={["pharmacy"]} />,
        children: [{ path: "pharmacy", element: <Pharmacy /> }],
      },
    ],
  },
]);

export default router;
