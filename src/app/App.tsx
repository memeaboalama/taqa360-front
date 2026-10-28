import React, { useEffect } from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { DataProvider } from './providers/DataProvider';
import { AuthProvider } from './providers/AuthProvider';
import AppRoutes from './routes/AppRoutes';
import ToastContainer from '../shared/components/Toast';
import { useData } from './providers/DataProvider';
import { LanguageProvider } from './providers/LanguageProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import ErrorBoundary from '../shared/components/ErrorBoundary';
import { initNavigationPersistence } from '../core/utils/router';

const AppContent: React.FC = () => {
    const { toasts } = useData();
    return (
        <>
            <ToastContainer notifications={toasts} />
            <AppRoutes />
        </>
    );
}

const App: React.FC = () => {
    useEffect(() => {
        initNavigationPersistence();
    }, []);

    return (
        <QueryProvider>
            <LanguageProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <DataProvider>
                            <ErrorBoundary>
                                <AppContent />
                            </ErrorBoundary>
                        </DataProvider>
                    </AuthProvider>
                </ThemeProvider>
            </LanguageProvider>
        </QueryProvider>
    );
};

export default App;
