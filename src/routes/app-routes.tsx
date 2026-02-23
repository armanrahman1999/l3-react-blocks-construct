import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/modules/dashboard';
import { FinancePage } from '@/modules/finance';
import { CalendarPage } from '@/modules/big-calendar';
import { EmailPage } from '@/modules/email';
import { ChatPage } from '@/modules/chat';
import { NotFoundPage, ServiceUnavailablePage } from '@/modules/error-view';
import { FileManagerMyFilesPage, SharedWithMePage, TrashPage } from '@/modules/file-manager';
import { ActivityLogPage, TimelinePage } from '@/modules/activity-log';
import { InventoryPage, InventoryDetailsPage, InventoryFormPage } from '@/modules/inventory';
import {
  InvoicesPage,
  InvoiceDetailsPage,
  CreateInvoicePage,
  EditInvoicePage,
} from '@/modules/invoices';
import { TaskManagerPage } from '@/modules/task-manager';
import { ProfilePage } from '@/modules/profile';
import { UsersTablePage } from '@/modules/iam';
import { MainLayout } from '@/layout/main-layout/main-layout';
import { AuthRoutes } from './auth.route';
import { Guard } from '@/state/store/auth/guard';
import { ProtectedRoute } from '@/state/store/auth/protected-route';
import { ClientMiddleware } from '@/state/client-middleware';
import { ThemeProvider } from '@/styles/theme/theme-provider';
import { SidebarProvider } from '@/components/ui-kit/sidebar';
import { Toaster } from '@/components/ui-kit/toaster';
import { useLanguageContext } from '@/i18n/language-context';
import { LoadingOverlay } from '@/components/core';
import { ChessTournamentPage } from '@/modules/chess-tournament/tournament-page';

export const AppRoutes = () => {
  const { isLoading } = useLanguageContext();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen">
      <ClientMiddleware>
        <ThemeProvider>
          <SidebarProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<AuthRoutes />} />

              {/* Main App Layout (Protected by Guard) */}
              <Route
                path="/"
                element={
                  <Guard>
                    <MainLayout />
                  </Guard>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/chess-tournament" element={<ChessTournamentPage />} />

                <Route
                  path="/finance"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <FinancePage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/identity-management" element={<UsersTablePage />} />

                {/* Inventory */}
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/details/:id" element={<InventoryDetailsPage />} />
                <Route path="/inventory/create" element={<InventoryFormPage />} />
                <Route path="/inventory/edit/:id" element={<InventoryFormPage />} />

                {/* Invoices */}
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/invoices/details/:id" element={<InvoiceDetailsPage />} />
                <Route path="/invoices/create" element={<CreateInvoicePage />} />
                <Route path="/invoices/edit/:id" element={<EditInvoicePage />} />

                {/* Other Modules */}
                <Route path="/task-manager" element={<TaskManagerPage />} />
                <Route path="/mail/inbox" element={<EmailPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/activity-log" element={<ActivityLogPage />} />
                <Route path="/timeline" element={<TimelinePage />} />

                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />

                {/* File Manager Routes */}
                <Route path="/file-manager/my-files" element={<FileManagerMyFilesPage />} />
                <Route path="/file-manager/shared-files" element={<SharedWithMePage />} />
                <Route path="/file-manager/trash" element={<TrashPage />} />

                {/* Error Pages */}
                <Route path="/503" element={<ServiceUnavailablePage />} />
                <Route path="/404" element={<NotFoundPage />} />
              </Route>

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/file-manager" element={<Navigate to="/file-manager/my-files" />} />
              <Route path="/my-files" element={<Navigate to="/file-manager/my-files" />} />
              <Route path="/shared-files" element={<Navigate to="/file-manager/shared-files" />} />
              <Route path="/trash" element={<Navigate to="/file-manager/trash" />} />

              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </SidebarProvider>
        </ThemeProvider>
      </ClientMiddleware>

      <Toaster />
    </div>
  );
};
