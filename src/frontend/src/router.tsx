import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import MainLayout from "./components/MainLayout";
import AboutPage from "./pages/AboutPage";
import AdminUserActivationPage from "./pages/AdminUserActivationPage";
import CheckImeiPage from "./pages/CheckImeiPage";
import HomePage from "./pages/HomePage";
import MyPhonesPage from "./pages/MyPhonesPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import ReportFoundPage from "./pages/ReportFoundPage";
import ReportLostPage from "./pages/ReportLostPage";
import StatisticsPage from "./pages/StatisticsPage";
import RootRoute from "./routes/RootRoute";

const rootRoute = createRootRoute({
  component: RootRoute,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: MainLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const phonesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/phones",
  component: MyPhonesPage,
});

const reportLostRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/report-lost",
  component: ReportLostPage,
});

const reportFoundRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/report-found",
  component: ReportFoundPage,
});

const checkRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/check",
  component: CheckImeiPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const statisticsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/statistics",
  component: StatisticsPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/about",
  component: AboutPage,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin",
  component: AdminUserActivationPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    phonesRoute,
    reportLostRoute,
    reportFoundRoute,
    checkRoute,
    notificationsRoute,
    statisticsRoute,
    aboutRoute,
    profileRoute,
    adminRoute,
  ]),
  notFoundRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
