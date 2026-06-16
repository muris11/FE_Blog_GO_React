import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import AdminLayout from '@/components/layout/AdminLayout';

// Public Pages
import HomePage from '@/features/public-blog/pages/HomePage';
import ArticleDetailPage from '@/features/public-blog/pages/ArticleDetailPage';
import BlogPage from '@/features/public-blog/pages/BlogPage';

// Auth Pages
import LoginPage from '@/features/auth/pages/LoginPage';

// Admin Pages
import DashboardPage from '@/features/admin-dashboard/DashboardPage';
import PostsPage from '@/features/posts/PostsPage';
import PostFormPage from '@/features/posts/PostFormPage';
import CategoriesPage from '@/features/categories/CategoriesPage';
import TagsPage from '@/features/tags/TagsPage';
import MediaPage from '@/features/media/MediaPage';
import UsersPage from '@/features/users/UsersPage';
import SettingsPage from '@/features/settings/SettingsPage';
import CommentsPage from '@/features/comments/CommentsPage';
import AuditLogsPage from '@/features/audit/AuditLogsPage';

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/blog',
    element: <BlogPage />,
  },
  {
    path: '/blog/:slug',
    element: <ArticleDetailPage />,
  },
  
  // Auth Routes
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Admin Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'posts',
        element: <PostsPage />,
      },
      {
        path: 'posts/create',
        element: <PostFormPage />,
      },
      {
        path: 'posts/:id/edit',
        element: <PostFormPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'tags',
        element: <TagsPage />,
      },
      {
        path: 'media',
        element: <MediaPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'comments',
        element: <CommentsPage />,
      },
      {
        path: 'audit-logs',
        element: <AuditLogsPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
