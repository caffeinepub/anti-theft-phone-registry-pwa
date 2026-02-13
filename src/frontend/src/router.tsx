import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import App from './App';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import MyPhonesPage from './pages/MyPhonesPage';
import ReportLostPage from './pages/ReportLostPage';
import CheckImeiPage from './pages/CheckImeiPage';
import NotificationsPage from './pages/NotificationsPage';
import StatisticsPage from './pages/StatisticsPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import AdminUserActivationPage from './pages/AdminUserActivationPage';
import NotFoundPage from './pages/NotFoundPage';

// Root route wraps everything with App (theme, toaster, auth gates)
const rootRoute = createRootRoute({
  component: App,
});

// Layout route for authenticated users - renders MainLayout with Outlet
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: MainLayout,
});

// Define all page routes as children of layout
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: HomePage,
});

const phonesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/phones',
  component: MyPhonesPage,
});

const reportLostRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/report-lost',
  component: ReportLostPage,
});

const checkRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/check',
  component: CheckImeiPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const statisticsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/statistics',
  component: StatisticsPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/about',
  component: AboutPage,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/profile',
  component: ProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: AdminUserActivationPage,
});

// Not found route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    phonesRoute,
    reportLostRoute,
    checkRoute,
    notificationsRoute,
    statisticsRoute,
    aboutRoute,
    profileRoute,
    adminRoute,
  ]),
  notFoundRoute,
]);

// Create and export the router
export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
