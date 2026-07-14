import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import { Suspense, lazy } from "react";
import PageLoader from "./Components/Loader/PageLoader";
import { useTheme } from "./context/ThemeProvider";
import ErrorBoundary from "./Components/Error/ErrorBoundary";
import ErrorPage from "./Components/Error/Error";
import ProtectedRoute from "./context/ProtectedRoute";
import { useAuth } from "./context/auth/AuthUser";
import DashboardRedirect from "./context/DashboradRedirect";

// Admin Pages
import AdminProfile from "./Dashborads/Admin/AdminProfile/AdminProfile";
import StatsOverview from "./Dashborads/Admin/StatsOverview/StatsOverview";
import ManagerControl from "./Dashborads/Admin/ManagerControl/ManagerControl";
import AdminNotification from "./Dashborads/Admin/AdminNotification/AdminNotification";
import AllMessage from "./Dashborads/Admin/AllMessage/AllMessage";
import ControlUser from "./Dashborads/Admin/ControlUsers/ControlUser";
import UserEditModal from "./Dashborads/Admin/ControlUsers/UserEditModal";
import InvestmentControl from "./Dashborads/Admin/InvestmentControl/InvestmentControl";
import InvestmentEditControl from "./Dashborads/Admin/InvestmentControl/InvestmentEditControl";
import CreatePlan from "./Dashborads/Admin/InvestmentControl/CreatePlan";
import CommissionLogs from "./Dashborads/Admin/CommissionLogs/CommissionLogs";
import MlmTree from "./Dashborads/Admin/MLMTree/MlmTree";
import AdminDeposits from "./Dashborads/Admin/Deposits/AdminDeposits";
import WithdrawalsAdmin from "./Dashborads/Admin/WithdrawalsAdmin/Withdrawal";
import PaymentHistory from "./Dashborads/Admin/PaymentHistory/PaymentHistory";
import SuperAdminPanel from "./Dashborads/Admin/AdminAccessRoute/SuperAdminPanel";

import "./App.css";

// Client Pages
import ClientDashborad from "./Dashborads/Client/Dashborad/ClientDashborad";
import UserProfile from "./Dashborads/Client/UserProfile/UserProfile";
import DepositFunds from "./Dashborads/Client/Deposit/DepositFunds";
import ClientMlmTree from "./Dashborads/Client/ClientMlM/ClientMLM";
import WalletCardMain from "./Dashborads/Client/Wallets/WalletCardMain";
import PeerToPeer from "./Dashborads/Client/P2P/PeerToPeer";
import Plans from "./Dashborads/Client/Plans/Plans";
import Withdrawal from "./Dashborads/Client/Withdrawal/Withdrawal";
import GetSupport from "./Dashborads/Client/GetSupport/GetSupport";
import AllTranstion from "./Dashborads/Client/AllTranstion/AllTranstion";
import ContactAllUsers from "./Dashborads/Admin/ContactAllUsers/ContactAllUsers";

// Lazy imports
const Home = lazy(() => import("./Pages/Home/Home"));
const About = lazy(() => import("./Pages/About/About"));
const Contact = lazy(() => import("./Pages/Contact/Contact"));
const FAQs = lazy(() => import("./Pages/FAQs/FAQs"));
const Login = lazy(() => import("./Pages/Form/SignIn/Login"));
const Register = lazy(() => import("./Pages/Form/SignUp/Register"));
const ForgetPasswordModal = lazy(() =>
  import("./Pages/Form/ForgetPassword/ForgetPassword")
);
const ResetPassword = lazy(() =>
  import("./Pages/Form/ResetPassword/ResetPassword")
);
const UserLayout = lazy(() => import("./Dashborads/Client/Layout/UserLayout"));
const AdminLayout = lazy(() => import("./Dashborads/Admin/Layout/AdminLayout"));

// Permission-based route wrapper
const PermissionProtectedRoute = ({ permissionKey, children }) => {
  const { user } = useAuth();
  if (user?.role === "admin") return children; // Admin bypass
  if (user?.role === "manager" && user?.permissions?.[permissionKey])
    return children;
  return <ErrorPage />; // No permission
};

const AppWrapper = () => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { isLoggedIn, user } = useAuth();

  const getDashboardRoute = () => {
    if (!user?.role) return "/user";
    switch (user.role) {
      case "admin":
      case "manager":
        return "/admin";
      case "user":
      default:
        return "/user";
    }
  };

  const hideHeaderFooter = ["/admin", "/user"].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode
            ? "text-white bg-gradient-to-br from-[#01060e] via-[#0f172a] to-[#020617]"
            : "bg-white text-black"
        }`}
      >
        <ErrorBoundary fallback={<ErrorPage />}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQs />} />
              <Route
                path="/login"
                element={
                  !isLoggedIn ? (
                    <Login />
                  ) : (
                    <Navigate to={getDashboardRoute()} replace />
                  )
                }
              />
              <Route
                path="/register"
                element={
                  !isLoggedIn ? (
                    <Register />
                  ) : (
                    <Navigate to={getDashboardRoute()} replace />
                  )
                }
              />
              <Route
                path="/forget-password"
                element={<ForgetPasswordModal />}
              />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              {/* User Dashboard */}
              <Route element={<ProtectedRoute roles={["user"]} />}>
                <Route path="/user" element={<UserLayout />}>
                  <Route index element={<ClientDashborad />} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="deposit" element={<DepositFunds />} />
                  <Route path="wallets" element={<WalletCardMain />} />
                  <Route path="self/mlm-tree" element={<ClientMlmTree />} />
                  <Route path="p2p-transfer" element={<PeerToPeer />} />
                  <Route path="getSupport" element={<GetSupport />} />
                  <Route
                    path="transactions/history"
                    element={<AllTranstion />}
                  />
                  <Route path="withdrawal" element={<Withdrawal />} />
                  <Route path="plans" element={<Plans />} />
                </Route>
              </Route>

              {/* Admin + Manager Dashboard */}
              <Route element={<ProtectedRoute roles={["admin", "manager"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<StatsOverview />} />
                  <Route path="profile" element={<AdminProfile />} />

                  <Route
                    path="all-access-control"
                    element={
                      <PermissionProtectedRoute permissionKey="manageManagers">
                        <ManagerControl />
                      </PermissionProtectedRoute>
                    }
                  />

                  <Route
                    path="all-admin/notification"
                    element={
                      <PermissionProtectedRoute permissionKey="viewNotifications">
                        <AdminNotification />
                      </PermissionProtectedRoute>
                    }
                  />

                  <Route
                    path="all-admin/message"
                    element={
                      <PermissionProtectedRoute permissionKey="viewMessages">
                        <AllMessage />
                      </PermissionProtectedRoute>
                    }
                  />

                  <Route
                    path="all-users-control"
                    element={
                      <PermissionProtectedRoute permissionKey="manageUsers">
                        <ControlUser />
                      </PermissionProtectedRoute>
                    }
                  />

                  <Route path="edit" element={<UserEditModal />} />

                  <Route
                    path="investments-control"
                    element={
                      <PermissionProtectedRoute permissionKey="manageInvestments">
                        <InvestmentControl />
                      </PermissionProtectedRoute>
                    }
                  />

                  <Route
                    path="investments-control/edit-plan/:id"
                    element={<InvestmentEditControl />}
                  />

                  <Route
                    path="investments-control/create-plan"
                    element={<CreatePlan />}
                  />

                  <Route
                    path="commission-logs"
                    element={
                      <PermissionProtectedRoute permissionKey="viewCommissions">
                        <CommissionLogs />
                      </PermissionProtectedRoute>
                    }
                  />

                  <Route
                    path="mlm-tree"
                    element={
                      <PermissionProtectedRoute permissionKey="viewMLM">
                        <MlmTree />
                      </PermissionProtectedRoute>
                    }
                  />

                  <Route
                    path="all-deposits"
                    element={
                      <PermissionProtectedRoute permissionKey="viewDeposits">
                        <AdminDeposits />
                      </PermissionProtectedRoute>
                    }
                  />

                  <Route
                    path="auth/withdrawals"
                    element={
                      <PermissionProtectedRoute permissionKey="viewWithdrawals">
                        <WithdrawalsAdmin />
                      </PermissionProtectedRoute>
                    }
                  />
                  <Route
                    path="auth/payment-history"
                    element={
                      <PermissionProtectedRoute permissionKey="paymentHistory">
                        <PaymentHistory />
                      </PermissionProtectedRoute>
                    }
                  />
                  <Route
                    path="auth/message-all-users"
                    element={
                      <PermissionProtectedRoute permissionKey="paymentHistory">
                        <ContactAllUsers />
                      </PermissionProtectedRoute>
                    }
                  />
                <Route
                  path="/admin/super-admin"
                  element={
                      <SuperAdminPanel />
                  }
                />
                </Route>
              </Route>

              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        {!hideHeaderFooter && <Footer />}
      </div>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
);

export default App;
