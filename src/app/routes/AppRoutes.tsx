import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useData } from '../providers/DataProvider';
import AdminApp from '../../features/admin/AdminApp';
import { EducatorApp } from '../../features/educator/EducatorApp';
import AdminAuthFlow from '../../features/auth/components/AdminAuthFlow';
import EducatorAuthFlow from '../../features/auth/components/EducatorAuthFlow';
import PendingApprovalScreen from '../../features/auth/components/PendingApprovalScreen';
import { Educator, EducatorViewType } from '../../shared/types';
import {
  goToAdminLogin,
  goToEducatorLogin,
  goToEducatorRegister,
  loadAdminRoute,
  loadEducatorRoute,
  onHashChange,
  saveAdminRoute,
  saveEducatorRoute
} from '../../core/utils/router';

// ----- Logged-out shell (separated admin + educator flows) -----
const LoggedOutShell: React.FC<{
  authStatus: string;
  onLogout: () => void;
}> = ({ authStatus, onLogout }) => {
  const { navigateToRegister, navigateToLogin } = useAuth();

  // Default to educator login for the public root. Admin has its own /admin path.
  const [route, setRoute] = useState<string>(() => {
    // return 'admin-auth';
    return 'educator-auth';
  });

  const [startAuthView, setStartAuthView] = useState<'educator-login' | 'register'>(() => {
    const p = window.location.pathname;
    return (p === '/register' || p === '/educator/register') ? 'register' : 'educator-login';
  });

  useEffect(() => {
    // Support direct navigation to educator login and register routes
    const path = window.location.pathname;
    if (path === '/register' || path === '/educator/register') {
      setRoute('educator-auth');
      setStartAuthView('register');
      navigateToRegister();
      if (path === '/register') {
        goToEducatorRegister();
      }
    } else if (path === '/login' || path === '/educator/login') {
      setRoute('educator-auth');
      setStartAuthView('educator-login');
      navigateToLogin();
      if (path === '/login') {
        goToEducatorLogin();
      }
    }
  }, [navigateToRegister, navigateToLogin]);

  useEffect(() => {
    const unsub = onHashChange(() => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) setRoute('admin-auth');
      else setRoute('educator-auth');
    });
    return unsub;
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (route === 'admin-auth') {
      if (!path.startsWith('/admin')) goToAdminLogin();
    } else {
      // Only set a default educator login path if not already under /educator
      if (!path.startsWith('/educator')) goToEducatorLogin();
    }
  }, [route]);

  // Only allow switching between admin and educator when explicitly on those paths.
  switch (authStatus) {
    case 'loggedOut':
      if (route === 'admin-auth') {
        return <AdminAuthFlow onSwitchToEducator={() => setRoute('educator-auth')} />;
      }
      return <EducatorAuthFlow startOnView={startAuthView} onSwitchToAdmin={() => setRoute('admin-auth')} />;
    case 'register':
      return <EducatorAuthFlow startOnView="register" onSwitchToAdmin={() => setRoute('admin-auth')} />;
    case 'pendingApproval':
      return <PendingApprovalScreen onLogout={onLogout} />;
    default:
      return null;
  }
};

// ----- Educator container (owns its state and syncs to hash) -----
const EducatorContainer: React.FC<{
  currentUser: Educator;
  onLogout: () => void;
}> = ({ currentUser, onLogout }) => {
  const data = useData();
  const initial = useMemo(() => loadEducatorRoute(), []);
  const initialView = (initial.view && initial.view !== 'login' ? initial.view : 'dashboard') as EducatorViewType;
  const [currentView, setCurrentView] = useState<EducatorViewType>(initialView);
  const [viewContext, setViewContext] = useState<any>(initial.ctx || null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    // write initial route to hash to prevent "login" leftover
    saveEducatorRoute(currentView, viewContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsub = onHashChange((state) => {
      if (state.role === 'educator') {
        const { view, ctx } = loadEducatorRoute();
        const nextView = view === 'login' ? 'dashboard' : (view as EducatorViewType);
        if (nextView && nextView !== currentView) setCurrentView(nextView as EducatorViewType);
        if (ctx !== undefined) setViewContext(ctx);
      }
    });
    return unsub;
  }, [currentView]);

  const navigateTo = (view: EducatorViewType, context: any = null) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
    setViewContext(context);
    saveEducatorRoute(view, context);
  };

  const {
    handleCreateBid,
    handleUpdateBid,
    handleUpdateEducatorProfile,
    handleAddSubTask,
    handleAddNote,
    handleCreateSupportTicket,
    handleAddSupportTicketReply,
    ...rest
  } = data;

  return (
    <EducatorApp
      currentView={currentView}
      viewContext={viewContext}
      navigateTo={navigateTo}
      currentUser={currentUser}
      projects={rest.projects}
      bids={rest.bids}
      withdrawals={rest.withdrawals}
      transactions={rest.transactions}
      inboxMessages={rest.inboxMessages}
      supportTickets={rest.supportTickets.filter(t => t.educatorId === currentUser.id)}
      adminMessages={rest.adminMessages}
      managedSkills={rest.managedSkills.filter(i => i.isActive).map(i => i.name)}
      managedMajors={rest.managedMajors.filter(i => i.isActive).map(i => i.name)}
      handleUpdateEducatorProfile={handleUpdateEducatorProfile}
      handleCreateBid={(bidData) => handleCreateBid(bidData, currentUser, navigateTo)}
      handleUpdateBid={(bidId, bidData) => handleUpdateBid(bidId, bidData, navigateTo)}
      handleAcceptInvitation={rest.handleAcceptInvitation}
      handleDeclineInvitation={rest.handleDeclineInvitation}
      handleUpdateTask={rest.handleUpdateTask}
      handleAddDeliverable={rest.handleAddDeliverable}
      handleEditDeliverable={rest.handleEditDeliverable}
      handleDeleteDeliverable={rest.handleDeleteDeliverable}
      handleAddSubTask={(pId, tId, title) => handleAddSubTask(pId, tId, title, currentUser)}
      handleEditSubTask={rest.handleEditSubTask}
      handleToggleSubTask={rest.handleToggleSubTask}
      handleAddSubTaskAttachment={rest.handleAddSubTaskAttachment}
      handleEditSubTaskAttachment={rest.handleEditSubTaskAttachment}
      handleDeleteSubTaskAttachment={rest.handleDeleteSubTaskAttachment}
      handleAddNote={(pId, tId, content) => handleAddNote(pId, tId, content, currentUser)}
      handleCreateSupportTicket={(ticketData) => handleCreateSupportTicket(ticketData, currentUser)}
      handleAddSupportTicketReply={(ticketId, replyData) => handleAddSupportTicketReply(ticketId, replyData, currentUser, 'educator')}
      handleLogout={onLogout}
      isMobile={isMobile}
      addToast={data.addToast}
      toasts={rest.toasts}
    />
  );
};

// ----- Admin container (owns its state and syncs to hash) -----
const AdminContainer: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const initial = useMemo(() => loadAdminRoute(), []);
  const [view, setView] = useState<string>(initial.view || 'dashboard');

  useEffect(() => {
    saveAdminRoute(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = onHashChange((state) => {
      if (state.role === 'admin') {
        const { view: v } = loadAdminRoute();
        if (v && v !== view) setView(v);
      }
    });
    return unsub;
  }, [view]);

  const navigateTo = (v: any, ctx?: any) => {
    setView(v);
    saveAdminRoute(String(v), ctx);
  };

  return <AdminApp onLogout={onLogout} />;
};

const AppRoutes: React.FC = () => {
  const { authStatus, userRole, currentUser, logout } = useAuth();

  const hasInviteToken = new URLSearchParams(window.location.search).has('token');

  // An invitation link only forces the register flow for logged-out users;
  // an already-authenticated session must keep its dashboard.
  if (hasInviteToken && authStatus !== 'loggedIn') {
    return (
      <div className="min-h-screen font-sans">
        <LoggedOutShell authStatus="register" onLogout={logout} />
      </div>
    );
  }

  if (authStatus !== 'loggedIn' || !userRole) {
    return (
      <div className="min-h-screen font-sans">
        <LoggedOutShell authStatus={authStatus} onLogout={logout} />
      </div>
    );
  }

  if (userRole === 'admin') {
    return <AdminContainer onLogout={logout} />;
  }

  if (userRole === 'educator') {
    if (!currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center shadow-xl">
            <h2 className="text-lg font-extrabold mb-2">تعذر تحميل لوحة المتخصص</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">حدثت مشكلة أثناء تحميل بيانات الحساب. يرجى المحاولة مرة أخرى.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg">إعادة المحاولة</button>
              <button onClick={logout} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg">تسجيل الخروج</button>
            </div>
          </div>
        </div>
      );
    }
    return <EducatorContainer currentUser={currentUser as Educator} onLogout={logout} />;
  }

  return null;
};

export default AppRoutes;
