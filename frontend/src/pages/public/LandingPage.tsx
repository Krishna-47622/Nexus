import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Dumbbell, Printer, FileText, ArrowRight, Zap, Lock, ShieldCheck } from 'lucide-react';

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

  const features = [
    {
      icon: Utensils,
      title: 'Canteen Ordering',
      desc: 'Browse live menus, increment carts, and track order preparation step-by-step.',
      color: 'from-clay-indigo to-clay-violet',
      badge: 'bg-clay-indigo/10 text-clay-indigo',
    },
    {
      icon: Dumbbell,
      title: 'Sports Equipment',
      desc: 'Real-time available inventory counts with staff approvals and automated overdue fine calculations.',
      color: 'from-clay-mint to-emerald-400',
      badge: 'bg-clay-mint/10 text-clay-mint',
    },
    {
      icon: Printer,
      title: 'Document Printing',
      desc: 'Upload PDF/DOCX files, configure color/duplex settings, calculate live page pricing, and track queue status.',
      color: 'from-clay-amber to-orange-400',
      badge: 'bg-clay-amber/10 text-amber-700',
    },
    {
      icon: FileText,
      title: 'Leave & Outpass',
      desc: 'Submit digital leave letters and outpass requests directly to Wardens with real-time decision remarks.',
      color: 'from-clay-coral to-rose-400',
      badge: 'bg-clay-coral/10 text-clay-coral',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Clay Hero */}
      <section ref={addToRef} className="fade-in-up clay-card bg-gradient-to-br from-clay-indigo via-clay-indigo-deep to-clay-violet p-8 md:p-14 relative overflow-hidden !shadow-clay-lg !border-0 space-y-8">
        {/* Decorative blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full bg-clay-violet/20 blur-2xl" />

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 shadow-clay-badge border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-clay-mint animate-clay-pulse" />
            Multi-Tenant Campus Operations Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Own The Campus <br />
            <span className="text-clay-indigo-light">Digital Utility Portal</span>
          </h1>

          <p className="text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed font-medium">
            Order canteen food, borrow sports gear, submit high-volume print jobs, and request hostel leave/outpass — all with seamless passthrough UPI payments.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white text-clay-indigo-deep font-bold text-sm rounded-full uppercase tracking-wider shadow-[4px_6px_14px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_8px_18px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-[0.97]"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white/10 text-white font-bold text-sm rounded-full uppercase tracking-wider border border-white/20 shadow-clay-badge hover:bg-white/20 transition-all active:scale-[0.97]"
            >
              Student &amp; Staff Login
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/15 max-w-4xl mx-auto text-center">
          {[
            { val: '9K+', label: 'Active Students' },
            { val: '4', label: 'Core Modules' },
            { val: '100%', label: 'Role Scoped' },
            { val: 'Instant', label: 'UPI Passthrough' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-2xl py-3 px-2 shadow-clay-badge border border-white/10">
              <div className="text-2xl md:text-3xl font-extrabold text-white">{s.val}</div>
              <div className="text-[10px] text-white/60 uppercase tracking-wider mt-1 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Services */}
      <section ref={addToRef} className="fade-in-up space-y-8">
        <div className="max-w-3xl space-y-2">
          <div className="clay-badge-indigo text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-clay-indigo" />
            Core Campus Services
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink">
            Engineered for daily campus life
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="clay-card p-6 space-y-4 group cursor-pointer active:scale-[0.97]">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} text-white flex items-center justify-center rounded-2xl shadow-clay-badge group-hover:animate-clay-bounce`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-ink text-lg">{f.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Operational Flow */}
      <section ref={addToRef} className="fade-in-up clay-card bg-gradient-to-br from-clay-indigo-deep to-clay-indigo !border-0 !shadow-clay-lg p-8 md:p-12 space-y-8 text-white">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-clay-indigo-light">
            <span className="w-2 h-2 rounded-full bg-clay-indigo-light" />
            Operational Flow
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            3 Steps from login to fulfillment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { num: '1', title: 'Select College & Login', desc: 'Authenticate with your Roll Number / College ID and pre-filled profile.' },
            { num: '2', title: 'Request Any Service', desc: 'Order meals, reserve sports gear, upload files, or apply for outpass.' },
            { num: '3', title: 'Pay via UPI Intent', desc: 'Direct passthrough payment via GPay, PhonePe, or Paytm. Zero stored wallets.' },
          ].map((step) => (
            <div key={step.num} className="bg-white/10 border border-white/15 p-6 rounded-clay shadow-clay-badge space-y-3 hover:-translate-y-1 transition-all active:scale-[0.97]">
              <div className="w-10 h-10 bg-white text-clay-indigo-deep font-extrabold rounded-2xl flex items-center justify-center text-sm shadow-clay-sm">
                {step.num}
              </div>
              <h3 className="font-bold text-lg text-white">{step.title}</h3>
              <p className="text-xs text-white/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Feature Cards */}
      <section ref={addToRef} className="fade-in-up grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="clay-card p-8 flex flex-col justify-between space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-clay-mint to-emerald-400 text-white rounded-2xl flex items-center justify-center shadow-clay-badge">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-ink">Direct UPI Intent Passthrough</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              No stored wallet balances or PPI liability. Every transaction generates a standard <code className="clay-badge-mint text-[10px] px-2 py-0.5 font-mono">upi://pay</code> intent string directly to the student's own UPI application.
            </p>
          </div>
        </div>

        <div className="clay-card p-8 flex flex-col justify-between space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-clay-indigo to-clay-sky text-white rounded-2xl flex items-center justify-center shadow-clay-badge">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-ink">Strict Institutional Isolation</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Every query is scoped by <code className="clay-badge-indigo text-[10px] px-2 py-0.5 font-mono">college_id</code> at the repository and security filter level. Colleges operate in complete isolation with role-scoped staff and warden dashboards.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
