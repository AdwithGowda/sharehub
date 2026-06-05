import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="relative min-h-screen overflow-x-clip bg-slate-50">
          {/* Decorative background blobs to match reference mockup */}
          <div className="absolute top-[-10%] right-[-10%] w-[35vw] h-[35vw] min-w-[300px] min-h-[300px] rounded-full bg-blue-100/40 blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-[10%] left-[-15%] w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] rounded-full bg-indigo-100/45 blur-3xl pointer-events-none z-0" />
          
          <div className="relative z-10">
            <AppRoutes />
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

