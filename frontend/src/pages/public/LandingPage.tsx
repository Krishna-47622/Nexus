import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Dumbbell, Printer, FileText, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((sec) => {
      if (sec) observer.observe(sec);
    });

    return () => observer.disconnect();
  }, []);

  const addToRef = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section ref={addToRef} className="fade-in-up max-w-6xl mx-auto px-6 text-center space-y-6 pt-8">
        <span className="px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-sm">
          Multi-Tenant Institutional SaaS
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Unified Campus Operations & Digital Utility Portal
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Order canteen food, borrow sports gear, submit high-volume print jobs, and request hostel leave/outpass — all with seamless passthrough UPI payments.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="px-6 py-3 bg-primary text-white font-semibold text-base rounded-sm hover:bg-primary-dark transition flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-white text-slate-800 font-semibold text-base border border-slate-300 rounded-sm hover:bg-slate-50 transition"
          >
            Student & Staff Login
          </Link>
        </div>
      </section>

      {/* Core Services Section */}
      <section ref={addToRef} className="fade-in-up max-w-6xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Core Campus Services</h2>
          <p className="text-slate-600 text-sm">Four integrated utility verticals engineered for daily campus life.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-3 hover:border-slate-400 transition">
            <div className="w-10 h-10 bg-slate-100 text-primary flex items-center justify-center rounded-sm">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Canteen Ordering</h3>
            <p className="text-sm text-slate-600">
              Browse live menus, increment carts, and track order preparation step-by-step.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-3 hover:border-slate-400 transition">
            <div className="w-10 h-10 bg-slate-100 text-primary flex items-center justify-center rounded-sm">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Sports Equipment</h3>
            <p className="text-sm text-slate-600">
              Real-time available inventory counts with staff approvals and automated overdue fine calculations.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-3 hover:border-slate-400 transition">
            <div className="w-10 h-10 bg-slate-100 text-primary flex items-center justify-center rounded-sm">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Document Printing</h3>
            <p className="text-sm text-slate-600">
              Upload PDF/DOCX files, configure color/duplex settings, calculate live page pricing, and track queue status.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-sm space-y-3 hover:border-slate-400 transition">
            <div className="w-10 h-10 bg-slate-100 text-primary flex items-center justify-center rounded-sm">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Leave & Outpass</h3>
            <p className="text-sm text-slate-600">
              Submit digital leave letters and outpass requests directly to Wardens with real-time decision remarks.
            </p>
          </div>
        </div>
      </section>

      {/* Operational Flow */}
      <section ref={addToRef} className="fade-in-up bg-slate-100 border-y border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Operational Flow</h2>
            <p className="text-slate-600 text-sm">3 simple steps from authentication to service fulfillment.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 border border-slate-200 rounded-sm space-y-2">
              <div className="w-8 h-8 bg-primary text-white font-bold rounded-sm mx-auto flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900">Select College & Login</h3>
              <p className="text-xs text-slate-600">Authenticate with your Roll Number / College ID and pre-filled profile.</p>
            </div>
            <div className="bg-white p-6 border border-slate-200 rounded-sm space-y-2">
              <div className="w-8 h-8 bg-primary text-white font-bold rounded-sm mx-auto flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900">Request Any Service</h3>
              <p className="text-xs text-slate-600">Order meals, reserve sports gear, upload files, or apply for outpass.</p>
            </div>
            <div className="bg-white p-6 border border-slate-200 rounded-sm space-y-2">
              <div className="w-8 h-8 bg-primary text-white font-bold rounded-sm mx-auto flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900">Pay via UPI Intent</h3>
              <p className="text-xs text-slate-600">Direct passthrough payment via GPay, PhonePe, or Paytm. Zero stored wallets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Integration */}
      <section ref={addToRef} className="fade-in-up max-w-6xl mx-auto px-6">
        <div className="bg-white border border-slate-200 p-8 rounded-sm flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-sm border border-emerald-200">
            <Zap className="w-8 h-8" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-xl font-bold text-slate-900">Direct UPI Intent Passthrough</h3>
            <p className="text-sm text-slate-600">
              No stored wallet balances or PPI liability. Every transaction generates a standard <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs">upi://pay</code> intent string directly to the student's own UPI application.
            </p>
          </div>
        </div>
      </section>

      {/* Multi-Tenant Infrastructure */}
      <section ref={addToRef} className="fade-in-up max-w-6xl mx-auto px-6">
        <div className="bg-white border border-slate-200 p-8 rounded-sm flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-blue-50 text-primary rounded-sm border border-blue-200">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-xl font-bold text-slate-900">Strict Institutional Isolation</h3>
            <p className="text-sm text-slate-600">
              Every query is scoped by <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs">college_id</code> at the repository and security filter level. Colleges operate in complete isolation with role-scoped staff and warden dashboards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
