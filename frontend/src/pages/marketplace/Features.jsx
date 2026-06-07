import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  MapPin, 
  Wrench, 
  ShieldCheck, 
  MessageSquare, 
  QrCode, 
  Wallet, 
  Smartphone, 
  LayoutDashboard, 
  Lock 
} from 'lucide-react';

const featuresData = [
  {
    id: 1,
    title: "Rent Tools Nearby",
    description: "Find tools available in your neighborhood and rent them quickly from verified users.",
    icon: MapPin,
    link: "/",
  },
  {
    id: 2,
    title: "List Your Tools for Rent",
    description: "Upload your unused tools, set pricing and availability, and earn extra income.",
    icon: Wrench,
    link: "/",
  },
  {
    id: 3,
    title: "KYC Verification",
    description: "Verify your identity with secure KYC to build trust and ensure safe transactions.",
    icon: ShieldCheck,
    link: "/",
  },
  {
    id: 4,
    title: "Secure Chat Between Users",
    description: "Communicate directly with owners and renters through an in-app chat system.",
    icon: MessageSquare,
    link: "/",
  },
  {
    id: 5,
    title: "QR Code Verification",
    description: "Verify pickup and return of tools securely using QR code scanning.",
    icon: QrCode,
    link: "/",
  },
  {
    id: 6,
    title: "Wallet Management",
    description: "Track earnings, deposits, refunds, and withdrawals through a secure digital wallet.",
    icon: Wallet,
    link: "/",
  },
  {
    id: 7,
    title: "Seamless Across All Devices",
    description: "Enjoy a seamless experience on mobile, tablet, and desktop devices with a fully responsive interface.",
    icon: Smartphone,
    link: "/",
  },
  {
    id: 8,
    title: "Centralized Admin Management",
    description: "Admin manages users, KYC requests, bookings, disputes, and platform security efficiently.",
    icon: LayoutDashboard,
    link: "/",
  },
  {
    id: 9,
    title: "Secure Authentication",
    description: "Protect user accounts with secure login, registration, and authentication mechanisms.",
    icon: Lock,
    link: "/",
  }
];

export default function Features() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Visual background grid pattern for top-tier SaaS aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      
      {/* Decorative colored glow blobs */}
      <div className="absolute top-[15%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FF6B35]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[25%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-[#FF6B35] bg-[#FF6B35]/10 border border-[#FF6B35]/20 animate-fade-in">
            Platform Capabilities
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mt-6 max-w-4xl mx-auto animate-fade-in">
            Powerful Features for <span className="text-[#FF6B35] relative">Safe & Easy<span className="absolute bottom-1 left-0 w-full h-2 bg-[#FF6B35]/15 -z-10 rounded-sm"></span></span> Tool Sharing
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed font-semibold animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            Discover the features that make renting and sharing tools simple, secure, and reliable.
          </p>
        </div>

        {/* Features Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative bg-white border border-slate-200/60 rounded-3xl p-8 shadow-xs hover:-translate-y-2 hover:shadow-xl hover:shadow-[#FF6B35]/5 hover:border-[#FF6B35]/30 hover:scale-[1.02] transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden animate-fade-in"
                style={{ 
                  animationDelay: `${index * 80 + 150}ms`, 
                  animationFillMode: 'both' 
                }}
              >
                {/* Accent line that slides in on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF6B35] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div>
                  {/* Premium Icon Wrapper with brand accent color */}
                  <div className="w-14 h-14 bg-[#FF6B35]/8 text-[#FF6B35] rounded-2xl flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-[#FF6B35] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#FF6B35]/20">
                    <IconComponent className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 tracking-tight transition-colors group-hover:text-slate-900 mt-6">
                    {feature.title}
                  </h3>

                  <p className="text-slate-500 text-sm leading-relaxed mt-3 font-semibold">
                    {feature.description}
                  </p>
                </div>

                <Link to={feature.link} className="mt-8 pt-4 border-t border-slate-50 flex items-center text-xs font-bold text-slate-400 group-hover:text-[#FF6B35] transition-colors duration-300">
                  <span>Explore features</span>
                  <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>

        {/* CTA Bottom Section */}
        <div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white p-8 sm:p-12 md:p-16 text-center max-w-5xl mx-auto mt-24 shadow-2xl border border-slate-800/80 animate-fade-in"
          style={{ animationDelay: '800ms', animationFillMode: 'both' }}
        >
          {/* Subtle inside glowing accents */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#FF6B35]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Start Sharing?
            </h2>
            <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
              Join our trusted community and start renting or listing tools today.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/" : "/register"}
                className="w-full sm:w-auto px-8 py-4 bg-[#FF6B35] hover:bg-[#E55A27] text-white font-extrabold rounded-2xl shadow-lg shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/35 transition-all duration-300 hover:scale-102 active:scale-98"
              >
                Get Started
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-2xl border border-slate-700/80 shadow-md transition-all duration-300 hover:scale-102 active:scale-98"
              >
                Explore Tools
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
