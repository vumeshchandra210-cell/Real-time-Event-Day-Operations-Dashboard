import { motion } from 'motion/react';
import BookingForm from './BookingForm';
import { 
  Calendar, 
  Clock, 
  Shield, 
  TrendingUp, 
  Users, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  MessageSquare,
  Volume2,
  Tv,
  Camera
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const features = [
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "Real-time Operations Check",
      desc: "Instant live task status coordination. Know exactly when decorations are complete, catering arrives, and sound checks finish."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-sky-500" />,
      title: "AI Operations Briefing",
      desc: "Our Gemini-powered assistant synthesizes logs to predict delays, assess risks, and recommend priority actions in real time."
    },
    {
      icon: <Layers className="w-6 h-6 text-success" />,
      title: "Integrated Inventory Sync",
      desc: "Assign cameras, microphones, LED walls, and tables with automatic booking schedules and damage tracking."
    },
    {
      icon: <Users className="w-6 h-6 text-warning" />,
      title: "Role-Based Workflows",
      desc: "Dedicated views for Operations leads, Finance coordinators, and department Leads (Sound, Catering, Decor)."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      title: "Live Cost Ledger & GST",
      desc: "Trace client milestones, vendor outlays, pending outstanding fees, and tax breakdowns on the fly."
    },
    {
      icon: <Shield className="w-6 h-6 text-danger" />,
      title: "Instant Blocker Escalation",
      desc: "Team leads raise high-priority issues instantly. The management dashboard alerts leads with sound alarm triggers."
    }
  ];

  const services = [
    { title: "Royal Weddings", desc: "Premium floral architecture, master staging, guest registration, and high-fidelity media.", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80" },
    { title: "Corporate Summits", desc: "Interactive LED setups, seamless mic arrays, international delegate registration portals.", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80" },
    { title: "Bespoke Birthdays", desc: "Interactive projection mappings, custom animations, mascot entries, and kid play zones.", image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80" },
    { title: "Live Concerts", desc: "Pro Line Array systems, ambient stage wash lighting, robust 150KVA power backup synchronization.", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600/20" id="landing_page">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold font-display shadow-lg shadow-blue-600/20">
            SLV
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900">SLV Events</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Features</a>
          <a href="#services" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Services</a>
          <a href="#preview" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Live Dashboard</a>
          <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Pricing</a>
        </div>
        <button 
          onClick={onEnterApp}
          className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-blue-600 hover:scale-[1.02] transition shadow-md hover:shadow-blue-600/20 cursor-pointer"
        >
          <span>Launch Console</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6 md:px-12 bg-gradient-to-b from-blue-50/50 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-xs font-semibold text-blue-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SaaS Platform for Ground Crew Coordination</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 leading-none">
              Real-time Event Day <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Operations</span> Dashboard
            </h1>
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Ditch messy phone calls and chaotic spreadsheets. Coordinate decoration, lighting, acoustics, catering, and guest management live. Power your decision making with real-time analytics and predictive AI briefs.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button 
                onClick={onEnterApp}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 hover:scale-[1.02] transition cursor-pointer"
              >
                <span>Launch Operations Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <a 
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Explore Features
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-sky-500/10 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-slate-900 text-white aspect-video p-1">
              {/* Fake Chrome Frame */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800 bg-slate-900">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 flex-1 text-[10px] text-slate-400 font-mono bg-slate-800/50 py-1 rounded px-3 truncate">
                  https://console.slvevents.com/dashboard/e1
                </div>
              </div>
              <div className="p-4 space-y-4 font-mono text-[10px]">
                <div className="flex justify-between items-center bg-slate-800/70 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-yellow-400 font-semibold">● LIVE OPERATIONS: THE KAPOOR WEDDING</span>
                  <span className="text-emerald-400">85% Complete</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block mb-1">DECORATION</span>
                    <span className="text-sm text-white font-bold block">75%</span>
                    <span className="text-[8px] text-emerald-400 block mt-1">In Progress</span>
                  </div>
                  <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-400 block mb-1">ACOUSTICS</span>
                    <span className="text-sm text-white font-bold block">60%</span>
                    <span className="text-[8px] text-yellow-400 block mt-1">Mic Check active</span>
                  </div>
                  <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 text-center text-red-400 border-red-900/30">
                    <span className="text-red-400 block mb-1">DRONE MEDIA</span>
                    <span className="text-sm font-bold block">BLOCKED</span>
                    <span className="text-[8px] block mt-1">Wind & Clearance</span>
                  </div>
                </div>
                <div className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 block mb-1">✨ GEMINI ASSISTANT ANALYSIS:</span>
                  <p className="text-slate-300 leading-relaxed text-[8px]">
                    Risk identified in Drone Videography due to Palace Grounds wind. Action: Reassign standby camera leads to gimbal shots and coordinate interior ballroom coverage. Reallocate 2 decor helpers.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Statistics Banner */}
      <section className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="block text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">450+</span>
            <span className="text-slate-400 text-sm mt-1 block">Events Executed</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">99.4%</span>
            <span className="text-slate-400 text-sm mt-1 block">On-Time Execution</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">25 Min</span>
            <span className="text-slate-400 text-sm mt-1 block">Coordination Saved / Hr</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">4.9/5</span>
            <span className="text-slate-400 text-sm mt-1 block">Average Client Rating</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase block">Ultimate Feature Set</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Everything you need on Event Day</h2>
          <p className="text-slate-600">SLV Events puts all coordination verticals onto a synchronized visual dashboard. Full transparency, zero lag, complete control.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-900">{feat.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Services Section */}
      <section id="services" className="bg-slate-100 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">Comprehensive Services</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-slate-900">Tailored Operational Blueprinting</h2>
            <p className="text-slate-600">No matter the format, scale, or layout complexity, we provision customized department task lists instantly.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition">
                <div className="h-48 overflow-hidden relative">
                  <img src={srv.image} alt={srv.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-bold text-lg text-slate-900">{srv.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">Client Success</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Praised by top Event Architects</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex gap-1 text-amber-500"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
            <p className="text-slate-600 text-sm italic">"SLV Events completely resolved on-site chaos. The Kapoor Royal Wedding had 850 guests and we handled 10+ sub-vendors simultaneously without a single delayed phone call."</p>
            <div>
              <span className="font-bold text-slate-900 block text-sm">Meenakshi Sundaram</span>
              <span className="text-xs text-slate-500 block">Lead Coordinator, Elite Weddings</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex gap-1 text-amber-500"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
            <p className="text-slate-600 text-sm italic">"The AI operations briefing is magical. It accurately highlighted that our sound systems rigging was running behind, and recommended pulling crew from valet. Pure genius."</p>
            <div>
              <span className="font-bold text-slate-900 block text-sm">Pranav Shah</span>
              <span className="text-xs text-slate-500 block">Chief Operations Officer, TechNova</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex gap-1 text-amber-500"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
            <p className="text-slate-600 text-sm italic">"The ledger and GST breakdowns make outstanding collections extremely easy. The Finance team is always aligned with the Operations lead in real-time."</p>
            <div>
              <span className="font-bold text-slate-900 block text-sm">Deepak Hegde</span>
              <span className="text-xs text-slate-500 block">Financial Director, Swarasadhana Trust</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table (Demo) */}
      <section id="pricing" className="bg-slate-950 text-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase block">Transparent Pricing</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Affordable Scale for Professional Agencies</h2>
            <p className="text-slate-400">Scale operations without hidden fees. Get full access to AI assistant suggestions and real-time updates.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600 block uppercase">Starter</span>
                <span className="text-3xl font-display font-bold mt-4 block">Free Demo</span>
                <p className="text-sm text-slate-400 mt-2">Perfect for evaluation and student review milestones.</p>
                <ul className="space-y-3 mt-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> 2 Active Live Events</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Basic Checklists</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Rule-based AI Fallbacks</li>
                  <li className="flex items-center gap-2 text-slate-500"><CheckCircle className="w-4 h-4 text-slate-700" /> Export PDFs/Excel</li>
                </ul>
              </div>
              <button onClick={onEnterApp} className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 transition text-sm font-medium">Get Started</button>
            </div>
            {/* Plan 2 */}
            <div className="bg-slate-900 p-8 rounded-2xl border-2 border-blue-600 relative flex flex-col justify-between shadow-xl shadow-blue-600/5">
              <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-bold uppercase tracking-wider">Most Popular</span>
              <div>
                <span className="text-xs font-semibold text-blue-600 block uppercase">Operations Pro</span>
                <span className="text-3xl font-display font-bold mt-4 block">INR 12,500 <span className="text-xs text-slate-400 font-normal">/ month</span></span>
                <p className="text-sm text-slate-400 mt-2">Engineered for active corporate & luxury wedding agencies.</p>
                <ul className="space-y-3 mt-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Unlimited Active Events</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Comprehensive Live Departments</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Real-time Gemini 3.5 AI Integration</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Full Finance, LED & Staff Control</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Export PDF/Excel/CSV ledger sheets</li>
                </ul>
              </div>
              <button onClick={onEnterApp} className="w-full mt-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-semibold">Launch Operations Pro</button>
            </div>
            {/* Plan 3 */}
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600 block uppercase">Enterprise</span>
                <span className="text-3xl font-display font-bold mt-4 block">Custom Pricing</span>
                <p className="text-sm text-slate-400 mt-2">Tailored for large venue complexes and global agencies.</p>
                <ul className="space-y-3 mt-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Custom SLA Agreements</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Multi-venue mapping & trackers</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> On-site DG system hardware sync</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /> Dedicated Account Manager</li>
                </ul>
              </div>
              <button onClick={onEnterApp} className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 transition text-sm font-medium">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Book an Event Form Section */}
      <section id="book-event" className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">Get a Customized Operational Blueprint</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-slate-900">
              Plan Your Next Event with Operational Precision
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Submit your event details and let our specialist coordinators build a master schedule, coordinate technical vendors, allocate pro staging inventory, and establish real-time dashboard tracking.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm">✓</div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider font-mono">Guaranteed 24-Hour Review</h4>
                  <p className="text-slate-500 text-xs">Our executive lead planner analyzes every resource request personally.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm">✓</div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider font-mono">Custom Ground Operations Portal</h4>
                  <p className="text-slate-500 text-xs">Access customized status checklists, automated risk predictions, and ledger logs.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <BookingForm />
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto space-y-8">
        <h2 className="font-display font-bold text-center text-3xl mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Can team leads update statuses directly from their mobile phones?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Yes! SLV Events features a mobile-responsive interface optimized for on-ground crew. Decoration leads, sound engineers, and chefs can complete checklists and report blockers instantly from any touch-enabled smartphone or tablet.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">How does the Gemini AI Operations Assistant analyze risks?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">The assistant parses the status, completion percentages, priorities, active blockers, and logs of all tasks. It compares these schedules with the event start time to predict logistical bottlenecks and suggests re-allocating staff from completed or non-critical duties.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Does the finance module calculate GST?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Absolutely. Every financial transaction can include custom tax structures, and the main ledger displays live totals for total revenue, expenditures, outstanding payments, and cumulative GST liabilities (18% standard event tax rate is pre-programmed).</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 text-center text-slate-500 text-xs space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            SLV
          </div>
          <span className="font-display font-semibold text-slate-900 text-sm">SLV Events &copy; 2026</span>
        </div>
        <p className="max-w-md mx-auto leading-relaxed">Commercial-grade event day operations console. Delivering pristine coordination and technical oversight across multi-cultural galas and executive summits.</p>
        <div className="flex justify-center gap-6 pt-2">
          <a href="#" className="hover:text-blue-600">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600">Terms of Service</a>
          <a href="#" className="hover:text-blue-600">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
