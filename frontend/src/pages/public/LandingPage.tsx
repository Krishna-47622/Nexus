import React from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Dumbbell,
  Printer,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Building,
  Clock,
  CreditCard,
  Lock,
  Layers,
  ChevronRight,
  Store,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const modules = [
    {
      id: 'canteen',
      icon: Utensils,
      title: 'Food Court & Dining',
      badge: 'MR Food Court - 1',
      desc: 'Live menu integration with university food courts. Counter-specific order routing, automated GST breakdown, and instant pickup tokens.',
      features: ['Live counter routing (DL Kitchen, Burger Haven)', 'Direct UPI QR & Isthara web sync', 'Zero wallet balance requirement'],
      link: '/login',
    },
    {
      id: 'sports',
      icon: Dumbbell,
      title: 'Sports Room Inventory',
      badge: 'Equipment & Arenas',
      desc: 'Real-time equipment checkout, staff verification, and automatic overdue tracking for university indoor and outdoor gear.',
      features: ['Live stock counts for racquets, balls & kits', 'Staff condition verification on return', 'Automated transparent late fee tracking'],
      link: '/login',
    },
    {
      id: 'print',
      icon: Printer,
      title: 'Digital Reprographics',
      badge: 'Academic Print Shop',
      desc: 'Upload course material, lab records, and thesis PDFs with automated page counting and instant job queue tracking.',
      features: ['Automated B&W & Color price estimator', 'Duplex discount & spiral binding options', 'Real-time print operator queue status'],
      link: '/login',
    },
    {
      id: 'leave',
      icon: FileText,
      title: 'Hostel Leave & Outpass',
      badge: 'Student Residences',
      desc: 'Paperless leave applications and emergency outpasses with real-time Warden approval remarks and digital gate clearance.',
      features: ['Parent contact verification & reason logs', 'Digital timestamped gate pass QR codes', 'Direct Warden approval remark dashboard'],
      link: '/login',
    },
  ];

  const portals = [
    {
      role: 'Students',
      desc: 'Order food, borrow sports equipment, print academic documents, and request hostel outpasses.',
      link: '/login',
      tag: 'Roll Number Login',
    },
    {
      role: 'Canteen & Sports Staff',
      desc: 'Fulfill live orders by counter franchise and manage equipment issue and return verification.',
      link: '/login',
      tag: 'Staff Dashboard',
    },
    {
      role: 'Hostel Wardens',
      desc: 'Review pending student leave applications, log remarks, and issue digital gate outpasses.',
      link: '/login',
      tag: 'Warden Portal',
    },
    {
      role: 'Institutional Admin',
      desc: 'Manage campus catalogs, batch import student records, oversee staff roles, and inspect audits.',
      link: '/login',
      tag: 'College Console',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* ──────── HERO SECTION ──────── */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto space-y-6">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Institutional Operating System • Malla Reddy University</span>
        </div>

        {/* Primary Headline */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.12]">
            Unified Digital Infrastructure <br />
            <span className="text-zinc-500 font-semibold">for Modern University Life.</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            One clean, centralized portal for campus dining, sports room inventory, academic reprographics, and hostel security — engineered with role isolation and direct UPI settlement.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <span>Sign In to Campus Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href="#modules"
            className="px-5 py-3 bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs rounded-xl border border-zinc-200 transition-colors"
          >
            Explore Services
          </a>
          <Link
            to="/platform-admin/login"
            className="px-4 py-3 text-zinc-500 hover:text-zinc-900 font-medium text-xs transition-colors flex items-center gap-1"
          >
            <span>Platform Root</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Core Stats Bar */}
        <div className="pt-8 border-t border-zinc-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="p-3 bg-white border border-zinc-200/70 rounded-xl">
            <div className="text-xl sm:text-2xl font-bold text-zinc-900">4 Core</div>
            <div className="text-[11px] text-zinc-500 font-medium mt-0.5">Campus Departments</div>
          </div>
          <div className="p-3 bg-white border border-zinc-200/70 rounded-xl">
            <div className="text-xl sm:text-2xl font-bold text-zinc-900">100%</div>
            <div className="text-[11px] text-zinc-500 font-medium mt-0.5">Role-Scoped Isolation</div>
          </div>
          <div className="p-3 bg-white border border-zinc-200/70 rounded-xl">
            <div className="text-xl sm:text-2xl font-bold text-zinc-900">Direct UPI</div>
            <div className="text-[11px] text-zinc-500 font-medium mt-0.5">Zero Wallet Liability</div>
          </div>
          <div className="p-3 bg-white border border-zinc-200/70 rounded-xl">
            <div className="text-xl sm:text-2xl font-bold text-zinc-900">Instant</div>
            <div className="text-[11px] text-zinc-500 font-medium mt-0.5">QR Token Clearance</div>
          </div>
        </div>
      </section>

      {/* ──────── CORE CAMPUS MODULES BENTO GRID ──────── */}
      <section id="modules" className="space-y-8 scroll-mt-20">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Campus Ecosystem
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Engineered for every daily campus interaction
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Eliminate fragmented physical lines, manual paperwork, and lost records across campus service counters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-7 space-y-5 hover:border-zinc-300 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full">
                      {m.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight">{m.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{m.desc}</p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-zinc-100">
                    {m.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-zinc-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    to={m.link}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
                  >
                    <span>Access service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────── OPERATIONAL SIMPLICITY FLOW ──────── */}
      <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Operational Protocol
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            How Nexus Streamlines Service Delivery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/60">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="font-bold text-sm text-zinc-900">Single Institutional Identity</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Log in once using your verified college Roll Number or Staff ID. Pre-mapped to your university college tenant with immediate role rights.
            </p>
          </div>

          <div className="space-y-2.5 p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/60">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="font-bold text-sm text-zinc-900">Direct Department Routing</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Orders and requests reach only the designated counter — food items to franchise kitchen screens, gear to sports room staff, and leaves to wardens.
            </p>
          </div>

          <div className="space-y-2.5 p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/60">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="font-bold text-sm text-zinc-900">Direct Passthrough Payments</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Scan dynamic UPI QR codes directly via GPay, PhonePe, or Paytm. Zero stored funds or wallet accounts, ensuring 100% financial compliance.
            </p>
          </div>
        </div>
      </section>

      {/* ──────── ROLE-SPECIFIC PORTALS SECTION ──────── */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Access Portals
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Tailored Experiences for Every Stakeholder
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {portals.map((p) => (
            <Link
              key={p.role}
              to={p.link}
              className="bg-white border border-zinc-200/80 hover:border-zinc-400 rounded-xl p-5 space-y-3 transition-colors flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded uppercase tracking-wider">
                  {p.tag}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors">
                  {p.role}
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{p.desc}</p>
              </div>

              <div className="pt-2 text-xs font-semibold text-zinc-900 flex items-center gap-1">
                <span>Enter portal</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
