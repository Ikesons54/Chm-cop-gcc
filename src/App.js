import { useState, useContext, createContext, useEffect, useRef } from "react";
import {
  Home, Users, QrCode, ClipboardList, Settings, ChevronLeft, ChevronRight,
  Search, Plus, Check, X, AlertTriangle, Clock, DollarSign, HeartHandshake,
  ShieldAlert, Building2, UserPlus, Baby, ArrowLeftRight, Bell, LogOut,
  WifiOff, Wifi, RefreshCw, MoreHorizontal, FileText, HelpCircle, Lock,
  MessageSquare, Sparkles, Shield, CheckCircle2, XCircle
} from "lucide-react";

// ---------------------------------------------------------------------------
// Brand tokens — from approved BrandConfiguration
// ---------------------------------------------------------------------------
const C = {
  gradStart: "#0B3D91", gradEnd: "#0A0F1A",
  gold: "#F5C542", goldSoft: "#FBEBB0",
  bg: "#F9FAFB", surface: "#FFFFFF", surfaceAlt: "#F1F3F6",
  ink: "#1F2937", inkSoft: "#6B7280", line: "#E5E7EB",
  success: "#10B981", successBg: "#DCFCE7",
  warn: "#F59E0B", warnBg: "#FEF3C7",
  danger: "#EF4444", dangerBg: "#FEE2E2",
  info: "#3B82F6", infoBg: "#DBEAFE",
};
const FONT = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');";
const GRAD = `linear-gradient(180deg, ${C.gradStart} 0%, ${C.gradEnd} 100%)`;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const ROLE_DEFS = [
  { code: "PRES_ELD", name: "Presiding Elder", category: "leadership", approval: true },
  { code: "DEAC", name: "Deacon", category: "leadership", approval: true },
  { code: "DEACONESS", name: "Deaconess", category: "leadership", approval: true },
  { code: "CLUST_LEAD", name: "Cluster Leader", category: "ministry", approval: false },
  { code: "CHOIR_LEAD", name: "Choir Leader", category: "ministry", approval: false },
  { code: "USHER", name: "Usher", category: "service", approval: false },
];

const INITIAL_PEOPLE = [
  { id: 1, first_name: "John", last_name: "Doe", phone: "+971 50 111 2233", email: "john@copad.ae", dob: "1985-04-12", membership_status: "member", is_child: false, cluster: "Al Fahim Cluster", ministry: "Ushering", churchRoles: ["Presiding Elder"], notes: "" },
  { id: 2, first_name: "Sarah", last_name: "Doe", phone: "+971 50 222 3344", email: "sarah@copad.ae", dob: "1988-09-02", membership_status: "member", is_child: false, cluster: "Al Fahim Cluster", ministry: "Choir", churchRoles: [], notes: "" },
  { id: 3, first_name: "David", last_name: "Doe", phone: "", email: "", dob: "2016-03-20", membership_status: "member", is_child: true, cluster: "", ministry: "", churchRoles: [], consent: true, notes: "" },
  { id: 4, first_name: "Ama", last_name: "Boateng", phone: "+971 50 333 4455", email: "ama@copad.ae", dob: "1990-01-15", membership_status: "member", is_child: false, cluster: "Al Bateen Cluster", ministry: "", churchRoles: [], notes: "Absent 3 consecutive services" },
  { id: 5, first_name: "Mary", last_name: "Johnson", phone: "+971 50 444 5566", email: "mary@copad.ae", dob: "1995-06-10", membership_status: "new_convert", is_child: false, cluster: "", ministry: "", churchRoles: [], notes: "" },
  { id: 6, first_name: "Kwame", last_name: "Owusu", phone: "+971 50 555 6677", email: "kwame@copad.ae", dob: "1980-11-05", membership_status: "member", is_child: false, cluster: "Al Bateen Cluster", ministry: "Ushering", churchRoles: ["Deacon"], notes: "" },
];

const INITIAL_HOUSEHOLDS = [
  { id: 1, name: "Doe Family", address: "Khalifa City, Abu Dhabi", members: [{ personId: 1, relationship: "parent", primaryContact: true }, { personId: 2, relationship: "spouse" }, { personId: 3, relationship: "child", primaryGuardian: 1 }] },
];

const INITIAL_CLUSTERS = [
  { id: 1, name: "Al Fahim Cluster", leader: "John Doe", memberCount: 24, meetingsLogged: 3 },
  { id: 2, name: "Al Bateen Cluster", leader: "Kwame Owusu", memberCount: 18, meetingsLogged: 2 },
];

const INITIAL_MINISTRIES = [
  { id: 1, name: "Ushering", type: "service_team", leader: "John Doe", memberCount: 9 },
  { id: 2, name: "Choir", type: "ministry", leader: "Sarah Doe", memberCount: 14 },
];

const INITIAL_EVENTS = [
  { id: 1, name: "Sunday Service (English)", type: "sunday_service", start: "Today, 8:00 AM", venue: "Main Hall" },
  { id: 2, name: "Wednesday Bible Study", type: "bible_study", start: "Wed, 7:00 PM", venue: "Fellowship Hall" },
];

const INITIAL_FOLLOWUPS = [
  { id: 1, personId: 5, name: "Mary Johnson", task_type: "visitor_first_contact", due: "2 days ago", overdue: true, status: "open" },
  { id: 2, personId: 5, name: "Mary Johnson", task_type: "discipleship", due: "Today", overdue: false, status: "open" },
];

const INITIAL_FINANCE = [
  { id: 1234, event: "Sunday Service", fund: "Tithe", amount: 2450, currency: "AED", recordedBy: "You", verifiedBy: null, status: "pending", notes: "" },
  { id: 1233, event: "Sunday Service", fund: "Offering", amount: 1890, currency: "AED", recordedBy: "You", verifiedBy: "Sarah Doe (demo)", status: "verified", notes: "" },
];

const INITIAL_PRAYERS = [
  { id: 1, category: "healing", description: "Please pray for my mother's recovery.", privacy: "pastoral_team", status: "new", by: "Ama Boateng", responses: [] },
  { id: 2, category: "family", description: "Restoration in my marriage.", privacy: "private", status: "in_prayer", by: "Anonymous", responses: [{ type: "note", note: "Prayed with member on call.", access: "private" }] },
];

const INITIAL_SAFEGUARDING = [
  { id: 789, type: "child_safeguarding", severity: "high", status: "under_review", description: "Reported concern during children's service.", personId: 3, actionTaken: "" },
];

const INITIAL_TRANSFERS = [
  { id: 1, personId: 6, name: "Kwame Owusu", from: "COP Abu Dhabi", to: "COP Dubai", status: "pending_out", requested: "01/09/2026" },
];

const INITIAL_FEEDBACK = [
  { id: 1, type: "improvement", title: "Add export to Excel", status: "in_progress" },
];

const INITIAL_ROLE_ASSIGNMENTS = [
  { id: 1, name: "John Doe", role: "PASTOR", scope: "COP Abu Dhabi", status: "active" },
  { id: 2, name: "Sarah Doe", role: "ASSEMADMIN", scope: "COP Abu Dhabi", status: "active" },
];

const FUNDS = ["Tithe", "Offering", "Missions", "Building Fund", "Welfare"];
const STATUS_OPTS = ["prospect", "visitor", "returning_visitor", "new_convert", "discipleship", "member", "worker", "officer", "transferred_out", "inactive", "archived"];

// ---------------------------------------------------------------------------
// Store (context)
// ---------------------------------------------------------------------------
const Store = createContext(null);
const useStore = () => useContext(Store);

function StoreProvider({ children }) {
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [households, setHouseholds] = useState(INITIAL_HOUSEHOLDS);
  const [clusters, setClusters] = useState(INITIAL_CLUSTERS);
  const [ministries, setMinistries] = useState(INITIAL_MINISTRIES);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [followups, setFollowups] = useState(INITIAL_FOLLOWUPS);
  const [finance, setFinance] = useState(INITIAL_FINANCE);
  const [prayers, setPrayers] = useState(INITIAL_PRAYERS);
  const [safeguarding, setSafeguarding] = useState(INITIAL_SAFEGUARDING);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [feedback, setFeedback] = useState(INITIAL_FEEDBACK);
  const [roleAssignments, setRoleAssignments] = useState(INITIAL_ROLE_ASSIGNMENTS);
  const [attendance, setAttendance] = useState({}); // eventId -> [personId,...]
  const [qrSessions, setQrSessions] = useState({}); // eventId -> {active, expiresIn}
  const [online, setOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState([]);
  const [nextId, setNextId] = useState(1000);
  const genId = () => { const id = nextId; setNextId((n) => n + 1); return id; };

  const value = {
    people, setPeople, households, setHouseholds, clusters, setClusters,
    ministries, setMinistries, events, setEvents, followups, setFollowups,
    finance, setFinance, prayers, setPrayers, safeguarding, setSafeguarding,
    transfers, setTransfers, feedback, setFeedback, roleAssignments, setRoleAssignments,
    attendance, setAttendance, qrSessions, setQrSessions, online, setOnline,
    syncQueue, setSyncQueue, genId,
  };
  return <Store.Provider value={value}>{children}</Store.Provider>;
}

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------
function Badge({ tone = "neutral", children }) {
  const tones = {
    neutral: [C.surfaceAlt, C.inkSoft], success: [C.successBg, "#166534"],
    warn: [C.warnBg, "#92400E"], danger: [C.dangerBg, "#991B1B"], info: [C.infoBg, "#1E40AF"],
    gold: [C.goldSoft, "#7A5B00"],
  };
  const [bg, fg] = tones[tone] || tones.neutral;
  return <span style={{ background: bg, color: fg }} className="px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">{children}</span>;
}

function Btn({ children, onClick, variant = "primary", full, disabled, small }) {
  const styles = {
    primary: { background: GRAD, color: "#fff" },
    gold: { background: C.gold, color: "#241D1B" },
    ghost: { background: C.surfaceAlt, color: C.ink },
    danger: { background: C.dangerBg, color: "#991B1B" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...styles[variant], opacity: disabled ? 0.5 : 1 }}
      className={`rounded-xl font-semibold flex items-center justify-center gap-1.5 ${full ? "w-full" : ""} ${small ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"}`}
    >
      {children}
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-semibold block mb-1" style={{ color: C.ink }}>{label}</label>
      {children}
      {hint && <p className="text-[10px] mt-1" style={{ color: C.inkSoft }}>{hint}</p>}
    </div>
  );
}
const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm outline-none border";
const inputStyle = { borderColor: C.line, background: C.surface, color: C.ink };
function TextInput(props) { return <input {...props} className={inputCls} style={inputStyle} />; }
function Select({ options, ...props }) {
  return (
    <select {...props} className={inputCls} style={inputStyle}>
      {options.map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  );
}
function TextArea(props) { return <textarea {...props} rows={3} className={inputCls} style={inputStyle} />; }

function Card({ children, onClick }) {
  return (
    <div onClick={onClick} className="rounded-xl p-3.5" style={{ background: C.surface, border: `1px solid ${C.line}`, cursor: onClick ? "pointer" : "default" }}>
      {children}
    </div>
  );
}

function Header({ title, subtitle, onBack, right }) {
  return (
    <div className="px-4 pt-3 pb-4" style={{ background: GRAD }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && <button onClick={onBack} className="p-1 -ml-1"><ChevronLeft size={20} color="#fff" /></button>}
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{title}</h1>
            {subtitle && <p className="text-[11px] truncate" style={{ color: C.gold }}>{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-xs text-center py-6" style={{ color: C.inkSoft }}>{text}</p>;
}

// ---------------------------------------------------------------------------
// AUTH-01 / AUTH-02 — Login
// ---------------------------------------------------------------------------
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (!username || !password) return setError("Please enter your username and password.");
    if (username !== "admin" || password !== "admin123") return setError("Invalid username or password.");
    setError("");
    onLogin();
  };
  return (
    <div className="h-full flex flex-col justify-center px-6" style={{ background: GRAD }}>
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: C.gold }}>
          <Sparkles size={26} color="#241D1B" />
        </div>
        <h1 className="text-2xl font-bold text-white">COP GCC Connect</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>COP Abu Dhabi — Sign in to continue</p>
      </div>
      <Field label={<span style={{ color: "#fff" }}>Username</span>}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin"
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }} />
      </Field>
      <Field label={<span style={{ color: "#fff" }}>Password</span>}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }} />
      </Field>
      {error && <p className="text-xs mb-3" style={{ color: "#FCA5A5" }}>{error}</p>}
      <Btn onClick={submit} variant="gold" full>Sign In</Btn>
      <p className="text-[10px] text-center mt-4" style={{ color: "rgba(255,255,255,0.5)" }}>
        Demo credentials — username: admin · password: admin123<br />
        © 2026 COP GCC Connect · Powered by FWXplus · V0.1 Beta
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCR-DASH-01 — Home Dashboard (AUTH-02, REP-01)
// ---------------------------------------------------------------------------
function DashboardScreen({ go }) {
  const { followups, finance, safeguarding, prayers } = useStore();
  const openTasks = followups.filter((f) => f.status === "open").length;
  const pendingBatches = finance.filter((f) => f.status === "pending").length;
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="COP Abu Dhabi" subtitle="Today, Sunday · 8:00 AM Service"
        right={<button onClick={() => go("notif")} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}><Bell size={17} color="#fff" /></button>} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <p className="text-xs font-semibold" style={{ color: C.inkSoft }}>Today's service</p>
          <p className="text-sm font-bold mt-0.5">Sunday Service — 8:00 AM, Main Hall</p>
          <div className="flex gap-2 mt-3">
            <Btn small variant="primary" onClick={() => go("att-checkin")}>Check-in</Btn>
            <Btn small variant="ghost" onClick={() => go("att-qr")}>Generate QR</Btn>
          </div>
        </Card>

        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: UserPlus, label: "Add Visitor", to: "vis-add" },
            { icon: Search, label: "People", to: "people" },
            { icon: QrCode, label: "Scan QR", to: "att-self" },
            { icon: ClipboardList, label: "Tasks", to: "tasks" },
          ].map((a) => (
            <button key={a.label} onClick={() => go(a.to)} className="rounded-xl py-3 flex flex-col items-center gap-1.5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <a.icon size={18} color={C.gradStart} />
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: C.ink }}>{a.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card><p className="text-2xl font-extrabold">{openTasks}</p><p className="text-[11px]" style={{ color: C.inkSoft }}>Tasks due</p></Card>
          <Card><p className="text-2xl font-extrabold">{pendingBatches}</p><p className="text-[11px]" style={{ color: C.inkSoft }}>Finance pending</p></Card>
        </div>

        <Card onClick={() => go("reports")}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2"><AlertTriangle size={16} color={C.warn} /> Exceptions dashboard</span>
            <ChevronRight size={16} color={C.inkSoft} />
          </div>
          <p className="text-[11px] mt-1" style={{ color: C.inkSoft }}>{followups.filter(f=>f.overdue).length} overdue follow-ups · {safeguarding.length} safeguarding case(s) · {prayers.filter(p=>p.status==="new").length} new prayer request(s)</p>
        </Card>

        <div>
          <p className="text-sm font-semibold mb-2">Explore all modules</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["People & Households", "people", Users], ["Clusters", "clusters", Building2],
              ["Ministries", "ministries", Building2], ["Events", "events", ClipboardList],
              ["Finance", "finance", DollarSign], ["Prayer & Care", "prayer", HeartHandshake],
              ["Safeguarding", "safeguarding", ShieldAlert], ["Transfers", "transfers", ArrowLeftRight],
              ["Admin", "admin", Settings], ["Help & Feedback", "help", HelpCircle],
            ].map(([label, id, Icon]) => (
              <button key={id} onClick={() => go(id)} className="rounded-xl px-3 py-2.5 flex items-center gap-2 text-left" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                <Icon size={15} color={C.gradStart} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PEOPLE — PPL-01,02,03,07 · CHILD-01,02 · MEM-01 · DISC-01 · HH
// ---------------------------------------------------------------------------
function PeopleListScreen({ go }) {
  const { people } = useStore();
  const [q, setQ] = useState("");
  const filtered = people.filter((p) => `${p.first_name} ${p.last_name}`.toLowerCase().includes(q.toLowerCase()));
  const statusTone = (s) => s === "member" ? "success" : s === "visitor" ? "info" : s === "new_convert" ? "gold" : "neutral";
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="People" subtitle={`${people.length} in COP Abu Dhabi`} onBack={() => go("home")}
        right={<button onClick={() => go("ppl-add")} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}><Plus size={17} color="#fff" /></button>} />
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <Search size={15} color={C.inkSoft} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name..." className="bg-transparent outline-none text-sm flex-1" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
        {filtered.map((p) => (
          <Card key={p.id} onClick={() => go("ppl-profile", { id: p.id })}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold flex items-center gap-1.5">{p.first_name} {p.last_name} {p.is_child && <Baby size={13} color={C.inkSoft} />}</p>
                <p className="text-[11px]" style={{ color: C.inkSoft }}>{p.cluster || "Unassigned"}{p.ministry ? ` · ${p.ministry}` : ""}</p>
              </div>
              <Badge tone={statusTone(p.membership_status)}>{p.membership_status.replace("_", " ")}</Badge>
            </div>
          </Card>
        ))}
        <Card onClick={() => go("hh-list")}>
          <span className="text-sm font-semibold flex items-center gap-2"><Home size={15} color={C.gradStart} /> Households</span>
        </Card>
      </div>
    </div>
  );
}

function PplAddScreen({ go }) {
  const { people, setPeople, genId } = useStore();
  const [f, setF] = useState({ first_name: "", last_name: "", phone: "", email: "", membership_status: "member" });
  const upd = (k, v) => setF({ ...f, [k]: v });
  const save = () => {
    if (!f.first_name || !f.last_name || !f.phone) return alert("Please fill in all required fields.");
    const id = genId();
    setPeople([...people, { id, ...f, is_child: false, cluster: "", ministry: "", churchRoles: [], notes: "" }]);
    go("ppl-profile", { id });
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Add Member" onBack={() => go("people")} />
      <div className="flex-1 overflow-y-auto p-4">
        <Field label="First name *"><TextInput value={f.first_name} onChange={(e) => upd("first_name", e.target.value)} /></Field>
        <Field label="Last name *"><TextInput value={f.last_name} onChange={(e) => upd("last_name", e.target.value)} /></Field>
        <Field label="Phone *"><TextInput value={f.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="+971 5..." /></Field>
        <Field label="Email"><TextInput value={f.email} onChange={(e) => upd("email", e.target.value)} /></Field>
        <Field label="Membership status *" hint="Church roles like Elder/Deacon are assigned separately.">
          <Select value={f.membership_status} onChange={(e) => upd("membership_status", e.target.value)} options={STATUS_OPTS} />
        </Field>
        <Btn full onClick={save}>Save Member</Btn>
      </div>
    </div>
  );
}

function PplProfileScreen({ go, params }) {
  const { people, setPeople, followups } = useStore();
  const person = people.find((p) => p.id === params.id);
  const [tab, setTab] = useState("overview");
  if (!person) return <EmptyState text="Not found" />;
  const myTasks = followups.filter((f) => f.personId === person.id);
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title={`${person.first_name} ${person.last_name}`} subtitle={person.membership_status.replace("_", " ")} onBack={() => go("people")} />
      <div className="flex gap-1 px-4 pt-3 overflow-x-auto">
        {["overview", "tasks", "notes"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ background: tab === t ? C.gradStart : C.surfaceAlt, color: tab === t ? "#fff" : C.ink }}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tab === "overview" && (
          <>
            <Card>
              <p className="text-xs" style={{ color: C.inkSoft }}>Phone</p><p className="text-sm font-medium mb-2">{person.phone || "—"}</p>
              <p className="text-xs" style={{ color: C.inkSoft }}>Cluster / Ministry</p><p className="text-sm font-medium">{person.cluster || "—"} {person.ministry ? `· ${person.ministry}` : ""}</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold mb-1.5">Church roles</p>
              {person.churchRoles.length ? person.churchRoles.map((r) => <Badge key={r} tone="gold">{r}</Badge>) : <p className="text-xs" style={{ color: C.inkSoft }}>None assigned</p>}
              <div className="mt-2"><Btn small variant="ghost" onClick={() => go("ppl-role", { id: person.id })}>Assign church role →</Btn></div>
            </Card>
            <div className="flex gap-2">
              <Btn small variant="ghost" onClick={() => go("ppl-status", { id: person.id })}>Change status</Btn>
              <Btn small variant="ghost" onClick={() => go("trf-request", { id: person.id })}>Request transfer</Btn>
              {person.membership_status === "new_convert" && <Btn small variant="ghost" onClick={() => go("disc-assign", { id: person.id })}>Assign discipleship</Btn>}
            </div>
          </>
        )}
        {tab === "tasks" && (myTasks.length ? myTasks.map((t) => (
          <Card key={t.id}><p className="text-sm font-medium">{t.task_type.replace(/_/g, " ")}</p><p className="text-[11px]" style={{ color: t.overdue ? "#991B1B" : C.inkSoft }}>Due {t.due}</p></Card>
        )) : <EmptyState text="No tasks for this person." />)}
        {tab === "notes" && (
          <TextArea value={person.notes} onChange={(e) => setPeople(people.map((p) => p.id === person.id ? { ...p, notes: e.target.value } : p))} placeholder="Pastoral / administrative notes..." />
        )}
      </div>
    </div>
  );
}

function PplRoleScreen({ go, params }) {
  const { people, setPeople } = useStore();
  const person = people.find((p) => p.id === params.id);
  const [role, setRole] = useState(ROLE_DEFS[0].code);
  const def = ROLE_DEFS.find((r) => r.code === role);
  const assign = () => {
    setPeople(people.map((p) => p.id === person.id ? { ...p, churchRoles: [...new Set([...p.churchRoles, def.name])] } : p));
    go("ppl-profile", { id: person.id });
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Assign Church Role" onBack={() => go("ppl-profile", { id: person.id })} />
      <div className="p-4">
        <p className="text-xs mb-3" style={{ color: C.inkSoft }}>Member: {person.first_name} {person.last_name}</p>
        <Field label="Church role *"><Select value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_DEFS.map((r) => ({ value: r.code, label: r.name }))} /></Field>
        <Field label="Scope"><Select value="COP Abu Dhabi" options={["COP Abu Dhabi"]} onChange={() => {}} /></Field>
        <Card><p className="text-xs">Requires approval: <b>{def.approval ? "Yes" : "No"}</b> <span style={{ color: C.inkSoft }}>(from role definition)</span></p></Card>
        <div className="mt-3"><Btn full onClick={assign}>Assign Role</Btn></div>
      </div>
    </div>
  );
}

function PplStatusScreen({ go, params }) {
  const { people, setPeople } = useStore();
  const person = people.find((p) => p.id === params.id);
  const [status, setStatus] = useState(person.membership_status);
  const [reason, setReason] = useState("");
  const save = () => {
    setPeople(people.map((p) => p.id === person.id ? { ...p, membership_status: status } : p));
    go("ppl-profile", { id: person.id });
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Change Membership Status" onBack={() => go("ppl-profile", { id: person.id })} />
      <div className="p-4">
        <p className="text-xs mb-1" style={{ color: C.inkSoft }}>Current: {person.membership_status}</p>
        <Field label="New status *"><Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTS} /></Field>
        <Field label="Reason"><TextInput value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        <Btn full onClick={save}>Save Status Change</Btn>
      </div>
    </div>
  );
}

function DiscAssignScreen({ go, params }) {
  const { people, followups, setFollowups, genId } = useStore();
  const person = people.find((p) => p.id === params.id);
  const [leader, setLeader] = useState("John Doe");
  const assign = () => {
    setFollowups([...followups, { id: genId(), personId: person.id, name: `${person.first_name} ${person.last_name}`, task_type: "discipleship", due: "In 3 days", overdue: false, status: "open" }]);
    go("ppl-profile", { id: person.id });
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Assign Discipleship Leader" onBack={() => go("ppl-profile", { id: person.id })} />
      <div className="p-4">
        <Field label="Discipleship leader"><Select value={leader} onChange={(e) => setLeader(e.target.value)} options={["John Doe", "Kwame Owusu"]} /></Field>
        <Btn full onClick={assign}>Assign Leader</Btn>
      </div>
    </div>
  );
}

function HhListScreen({ go }) {
  const { households, people } = useStore();
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Households" onBack={() => go("people")} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {households.map((h) => (
          <Card key={h.id}>
            <p className="text-sm font-semibold">{h.name}</p>
            <p className="text-[11px] mb-2" style={{ color: C.inkSoft }}>{h.address}</p>
            {h.members.map((m) => {
              const p = people.find((x) => x.id === m.personId);
              return <p key={m.personId} className="text-xs">• {p?.first_name} {p?.last_name} — {m.relationship}{m.primaryGuardian ? " (primary guardian)" : ""}</p>;
            })}
          </Card>
        ))}
        <Btn full variant="ghost" onClick={() => go("child-register")}><Baby size={15} /> Register a child</Btn>
      </div>
    </div>
  );
}

function ChildRegisterScreen({ go }) {
  const { people, setPeople, genId } = useStore();
  const [f, setF] = useState({ first_name: "", last_name: "", dob: "", guardian: "John Doe", consent: false });
  const save = () => {
    if (!f.first_name || !f.dob) return alert("Please fill in required fields.");
    if (!f.consent) return alert("Guardian consent must be captured before saving.");
    setPeople([...people, { id: genId(), ...f, phone: "", email: "", membership_status: "member", is_child: true, cluster: "", ministry: "", churchRoles: [], notes: "" }]);
    go("hh-list");
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Register Child" onBack={() => go("hh-list")} />
      <div className="p-4">
        <Field label="First name *"><TextInput value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></Field>
        <Field label="Last name"><TextInput value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></Field>
        <Field label="Date of birth *"><TextInput type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
        <Field label="Guardian"><Select value={f.guardian} onChange={(e) => setF({ ...f, guardian: e.target.value })} options={["John Doe", "Sarah Doe"]} /></Field>
        <label className="flex items-center gap-2 text-xs mb-3"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> Guardian consent granted</label>
        <p className="text-[11px] mb-3" style={{ color: "#991B1B" }}>⚠ Children cannot be checked in without consent.</p>
        <Btn full onClick={save}>Save Child</Btn>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VISITORS & FOLLOW-UP — VIS-01, VIS-02, FU-01
// ---------------------------------------------------------------------------
function VisAddScreen({ go }) {
  const { people, setPeople, followups, setFollowups, genId } = useStore();
  const [f, setF] = useState({ first_name: "", last_name: "", phone: "", consent: false });
  const save = () => {
    if (!f.first_name || !f.phone) return alert("First name and phone are required.");
    const id = genId();
    setPeople([...people, { id, first_name: f.first_name, last_name: f.last_name, phone: f.phone, email: "", membership_status: "visitor", is_child: false, cluster: "", ministry: "", churchRoles: [], notes: "" }]);
    setFollowups([...followups, { id: genId(), personId: id, name: `${f.first_name} ${f.last_name}`, task_type: "visitor_first_contact", due: "Within 48 hours", overdue: false, status: "open" }]);
    go("tasks");
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Add Visitor" onBack={() => go("home")} />
      <div className="p-4">
        <Field label="First name *"><TextInput value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></Field>
        <Field label="Last name"><TextInput value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></Field>
        <Field label="Phone *"><TextInput value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-xs mb-3"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> Consent to be contacted</label>
        <p className="text-[11px] mb-3" style={{ color: C.inkSoft }}>A follow-up task will be created automatically, due within 48 hours.</p>
        <Btn full onClick={save}>Save Visitor</Btn>
      </div>
    </div>
  );
}

function TasksScreen({ go }) {
  const { followups, setFollowups, finance } = useStore();
  const complete = (id) => setFollowups(followups.map((f) => f.id === id ? { ...f, status: "completed" } : f));
  const pendingFinance = finance.filter((f) => f.status === "pending");
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Tasks" subtitle="Aggregated: follow-up, discipleship, finance" onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {followups.filter((f) => f.status === "open").map((t) => (
          <Card key={t.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t.name} — {t.task_type.replace(/_/g, " ")}</p>
                <p className="text-[11px]" style={{ color: t.overdue ? "#991B1B" : C.inkSoft }}>{t.overdue ? "⚠ Overdue" : "Due"}: {t.due}</p>
              </div>
              <Btn small variant="ghost" onClick={() => complete(t.id)}>Complete</Btn>
            </div>
          </Card>
        ))}
        {pendingFinance.map((b) => (
          <Card key={`fin-${b.id}`} onClick={() => go("fin-detail", { id: b.id })}>
            <p className="text-sm font-medium">Verify: Batch #{b.id} — {b.fund}</p>
            <p className="text-[11px]" style={{ color: C.inkSoft }}>{b.currency} {b.amount} · pending verification</p>
          </Card>
        ))}
        {followups.filter((f) => f.status === "open").length === 0 && pendingFinance.length === 0 && <EmptyState text="No open tasks." />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CLUSTERS & MINISTRIES — CLUST-01, CLUST-02, MIN-01, MIN-02
// ---------------------------------------------------------------------------
function ClustersScreen({ go }) {
  const { clusters, setClusters, people, setPeople, genId } = useStore();
  const [logging, setLogging] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [log, setLog] = useState({ date: "", topic: "", attendance: "", visitors: "" });
  const submitLog = () => {
    setClusters(clusters.map((c) => c.id === logging.id ? { ...c, meetingsLogged: c.meetingsLogged + 1 } : c));
    setLogging(null); setLog({ date: "", topic: "", attendance: "", visitors: "" });
  };
  const submitAssign = (personId) => {
    setPeople(people.map((p) => p.id === personId ? { ...p, cluster: assigning.name } : p));
    setClusters(clusters.map((c) => c.id === assigning.id ? { ...c, memberCount: c.memberCount + 1 } : c));
    setAssigning(null);
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Clusters" onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {clusters.map((c) => (
          <Card key={c.id}>
            <p className="text-sm font-semibold">{c.name}</p>
            <p className="text-[11px] mb-2" style={{ color: C.inkSoft }}>Leader: {c.leader} · {c.memberCount} members · {c.meetingsLogged} logs</p>
            <div className="flex gap-2">
              <Btn small variant="ghost" onClick={() => setLogging(c)}>Submit meeting log</Btn>
              <Btn small variant="ghost" onClick={() => setAssigning(c)}>Assign member</Btn>
            </div>
          </Card>
        ))}
      </div>
      {logging && (
        <Modal title={`Meeting log — ${logging.name}`} onClose={() => setLogging(null)}>
          <Field label="Meeting date"><TextInput type="date" value={log.date} onChange={(e) => setLog({ ...log, date: e.target.value })} /></Field>
          <Field label="Topic"><TextInput value={log.topic} onChange={(e) => setLog({ ...log, topic: e.target.value })} /></Field>
          <Field label="Attendance count"><TextInput type="number" value={log.attendance} onChange={(e) => setLog({ ...log, attendance: e.target.value })} /></Field>
          <Field label="Visitor count"><TextInput type="number" value={log.visitors} onChange={(e) => setLog({ ...log, visitors: e.target.value })} /></Field>
          <Btn full onClick={submitLog}>Submit Log</Btn>
        </Modal>
      )}
      {assigning && (
        <Modal title={`Assign to ${assigning.name}`} onClose={() => setAssigning(null)}>
          {people.filter((p) => !p.is_child).map((p) => (
            <button key={p.id} onClick={() => submitAssign(p.id)} className="w-full text-left px-3 py-2.5 rounded-lg mb-1.5 text-sm" style={{ background: C.surfaceAlt }}>{p.first_name} {p.last_name}</button>
          ))}
        </Modal>
      )}
    </div>
  );
}

function MinistriesScreen({ go }) {
  const { ministries, setMinistries, people, setPeople, genId } = useStore();
  const [creating, setCreating] = useState(false);
  const [nf, setNf] = useState({ name: "", type: "ministry", leader: "" });
  const [assigning, setAssigning] = useState(null);
  const create = () => {
    if (!nf.name) return;
    setMinistries([...ministries, { id: genId(), ...nf, memberCount: 0 }]);
    setCreating(false); setNf({ name: "", type: "ministry", leader: "" });
  };
  const submitAssign = (personId) => {
    setPeople(people.map((p) => p.id === personId ? { ...p, ministry: assigning.name } : p));
    setMinistries(ministries.map((m) => m.id === assigning.id ? { ...m, memberCount: m.memberCount + 1 } : m));
    setAssigning(null);
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Ministries" onBack={() => go("home")}
        right={<button onClick={() => setCreating(true)} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}><Plus size={17} color="#fff" /></button>} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {ministries.map((m) => (
          <Card key={m.id}>
            <p className="text-sm font-semibold">{m.name}</p>
            <p className="text-[11px] mb-2" style={{ color: C.inkSoft }}>{m.type} · Leader: {m.leader || "—"} · {m.memberCount} members</p>
            <Btn small variant="ghost" onClick={() => setAssigning(m)}>Assign member</Btn>
          </Card>
        ))}
      </div>
      {creating && (
        <Modal title="Create Ministry" onClose={() => setCreating(false)}>
          <Field label="Name *"><TextInput value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} /></Field>
          <Field label="Type"><Select value={nf.type} onChange={(e) => setNf({ ...nf, type: e.target.value })} options={["ministry", "department", "service_team"]} /></Field>
          <Field label="Leader"><TextInput value={nf.leader} onChange={(e) => setNf({ ...nf, leader: e.target.value })} /></Field>
          <Btn full onClick={create}>Create Ministry</Btn>
        </Modal>
      )}
      {assigning && (
        <Modal title={`Assign to ${assigning.name}`} onClose={() => setAssigning(null)}>
          {people.filter((p) => !p.is_child).map((p) => (
            <button key={p.id} onClick={() => submitAssign(p.id)} className="w-full text-left px-3 py-2.5 rounded-lg mb-1.5 text-sm" style={{ background: C.surfaceAlt }}>{p.first_name} {p.last_name}</button>
          ))}
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EVENTS + ATTENDANCE — EVT-01, ATT-01,02,03
// ---------------------------------------------------------------------------
function EventsScreen({ go }) {
  const { events, setEvents, genId } = useStore();
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ name: "", type: "sunday_service", start: "", venue: "" });
  const create = () => {
    if (!f.name || !f.start) return;
    setEvents([...events, { id: genId(), ...f }]);
    setCreating(false); setF({ name: "", type: "sunday_service", start: "", venue: "" });
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Services & Events" onBack={() => go("home")}
        right={<button onClick={() => setCreating(true)} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}><Plus size={17} color="#fff" /></button>} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {events.map((ev) => (
          <Card key={ev.id}>
            <p className="text-sm font-semibold">{ev.name}</p>
            <p className="text-[11px]" style={{ color: C.inkSoft }}>{ev.start} · {ev.venue}</p>
          </Card>
        ))}
      </div>
      {creating && (
        <Modal title="Create Service / Event" onClose={() => setCreating(false)}>
          <Field label="Name *"><TextInput value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} options={["sunday_service", "bible_study", "prayer_meeting", "cluster_meeting", "youth", "children", "convention"]} /></Field>
          <Field label="Start"><TextInput value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} placeholder="e.g. Fri, 7:00 PM" /></Field>
          <Field label="Venue"><TextInput value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} /></Field>
          <Btn full onClick={create}>Create Event</Btn>
        </Modal>
      )}
    </div>
  );
}

function AttQrScreen({ go }) {
  const { events, qrSessions, setQrSessions } = useStore();
  const [eventId, setEventId] = useState(events[0]?.id);
  const session = qrSessions[eventId];
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!session?.active) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [session]);
  const generate = () => { setQrSessions({ ...qrSessions, [eventId]: { active: true } }); setSeconds(900); };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Generate QR Code" onBack={() => go("home")} />
      <div className="p-4">
        <Field label="Service"><Select value={eventId} onChange={(e) => setEventId(Number(e.target.value))} options={events.map((e) => ({ value: e.id, label: e.name }))} /></Field>
        {!session?.active ? <Btn full onClick={generate}>Generate QR</Btn> : (
          <div className="rounded-2xl p-5 flex flex-col items-center" style={{ background: C.gradEnd }}>
            <div className="grid grid-cols-6 gap-[3px] p-3 rounded-lg mb-3" style={{ background: "#fff" }}>
              {Array.from({ length: 36 }).map((_, i) => <div key={i} className="w-2.5 h-2.5" style={{ background: [2,4,8,13,17,21,26,29,33].includes(i) ? "#fff" : C.gradEnd }} />)}
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Valid for {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AttSelfScreen({ go }) {
  const { events, qrSessions, attendance, setAttendance } = useStore();
  const [done, setDone] = useState(false);
  const event = events[0];
  const checkedIn = (attendance[event.id] || []).includes("admin");
  const scan = () => {
    if (!qrSessions[event.id]?.active) return alert("No active QR session — generate one first.");
    if (checkedIn) return;
    setAttendance({ ...attendance, [event.id]: [...(attendance[event.id] || []), "admin"] });
    setDone(true);
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Check In" onBack={() => go("home")} />
      <div className="p-4">
        {done || checkedIn ? (
          <Card><p className="text-sm font-semibold flex items-center gap-2"><CheckCircle2 size={16} color={C.success} /> Checked in successfully!</p><p className="text-[11px]" style={{ color: C.inkSoft }}>{event.name}</p></Card>
        ) : (
          <>
            <div className="rounded-2xl h-40 flex items-center justify-center mb-3" style={{ background: C.surfaceAlt, border: `2px dashed ${C.line}` }}>
              <p className="text-xs" style={{ color: C.inkSoft }}>Simulated QR scanner view</p>
            </div>
            <Btn full onClick={scan}>Simulate Scan</Btn>
            <p className="text-[10px] mt-2 text-center" style={{ color: C.inkSoft }}>Requires an authenticated session — no phone-number-only check-in.</p>
          </>
        )}
      </div>
    </div>
  );
}

function AttCheckinScreen({ go }) {
  const { events, people, attendance, setAttendance } = useStore();
  const event = events[0];
  const list = attendance[event.id] || [];
  const toggle = (name) => setAttendance({ ...attendance, [event.id]: list.includes(name) ? list.filter((n) => n !== name) : [...list, name] });
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Usher Check-in" subtitle={event.name} onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {people.map((p) => {
          const name = `${p.first_name} ${p.last_name}`;
          const present = list.includes(name);
          const blocked = p.is_child && !p.consent;
          return (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{name} {p.is_child && <Baby size={12} className="inline" />}</p>
                  {blocked && <p className="text-[10px]" style={{ color: "#991B1B" }}>Consent required</p>}
                </div>
                <Btn small variant={present ? "primary" : "ghost"} disabled={blocked} onClick={() => toggle(name)}>{present ? "Present" : "Mark"}</Btn>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="p-4 border-t" style={{ borderColor: C.line }}>
        <p className="text-xs mb-2 text-center" style={{ color: C.inkSoft }}>{list.length} marked present</p>
        <Btn full onClick={() => go("home")}>Save Check-in</Btn>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FINANCE — FIN-01, FIN-02
// ---------------------------------------------------------------------------
function FinanceScreen({ go }) {
  const { finance, setFinance, events, genId } = useStore();
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ event: events[0]?.name, fund: FUNDS[0], amount: "" });
  const create = () => {
    if (!f.amount) return;
    setFinance([{ id: genId(), ...f, currency: "AED", recordedBy: "You", verifiedBy: null, status: "pending", notes: "" }, ...finance]);
    setCreating(false); setF({ event: events[0]?.name, fund: FUNDS[0], amount: "" });
  };
  const statusTone = { pending: "warn", verified: "info", locked: "neutral", reconciled: "success", disputed: "danger" };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Finance" onBack={() => go("home")}
        right={<button onClick={() => setCreating(true)} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}><Plus size={17} color="#fff" /></button>} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {finance.map((b) => (
          <Card key={b.id} onClick={() => go("fin-detail", { id: b.id })}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-semibold">Batch #{b.id} — {b.fund}</p><p className="text-[11px]" style={{ color: C.inkSoft }}>{b.event} · {b.currency} {b.amount}</p></div>
              <Badge tone={statusTone[b.status]}>{b.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
      {creating && (
        <Modal title="Record Collection Batch" onClose={() => setCreating(false)}>
          <Field label="Service"><Select value={f.event} onChange={(e) => setF({ ...f, event: e.target.value })} options={events.map((e) => e.name)} /></Field>
          <Field label="Fund"><Select value={f.fund} onChange={(e) => setF({ ...f, fund: e.target.value })} options={FUNDS} /></Field>
          <Field label="Total amount (AED) *"><TextInput type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
          <p className="text-[10px] mb-2" style={{ color: C.inkSoft }}>Recorded by: You. A different Finance Officer must verify.</p>
          <Btn full onClick={create}>Save as Pending</Btn>
        </Modal>
      )}
    </div>
  );
}

function FinDetailScreen({ go, params }) {
  const { finance, setFinance } = useStore();
  const batch = finance.find((b) => b.id === params.id);
  if (!batch) return <EmptyState text="Not found" />;
  const update = (fields) => setFinance(finance.map((b) => b.id === batch.id ? { ...b, ...fields } : b));
  const isSelfRecorder = batch.recordedBy === "You";
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title={`Batch #${batch.id}`} onBack={() => go("finance")} />
      <div className="p-4 space-y-3">
        <Card>
          <p className="text-sm">Service: <b>{batch.event}</b></p>
          <p className="text-sm">Fund: <b>{batch.fund}</b></p>
          <p className="text-sm">Amount: <b>{batch.currency} {batch.amount}</b></p>
          <p className="text-sm">Status: <Badge tone="info">{batch.status}</Badge></p>
          <p className="text-sm mt-1">Recorded by: {batch.recordedBy} · Verified by: {batch.verifiedBy || "—"}</p>
        </Card>
        {batch.status === "pending" && (
          isSelfRecorder
            ? <p className="text-xs rounded-lg p-3" style={{ background: C.dangerBg, color: "#991B1B" }}>You recorded this batch and cannot verify it yourself (dual-control). Waiting for another Finance Officer.</p>
            : <Btn full onClick={() => update({ status: "verified", verifiedBy: "Sarah Doe" })}>Verify Batch</Btn>
        )}
        {batch.status === "verified" && <Btn full onClick={() => update({ status: "locked" })}>Lock Batch</Btn>}
        {batch.status === "locked" && (
          <div className="flex gap-2">
            <Btn small onClick={() => update({ status: "reconciled" })}>Mark Reconciled</Btn>
            <Btn small variant="danger" onClick={() => update({ status: "disputed" })}>Mark Disputed</Btn>
          </div>
        )}
        {/* Demo shortcut: allow verifying own batch to show the full workflow without a second login */}
        {batch.status === "pending" && isSelfRecorder && (
          <Btn small variant="ghost" onClick={() => update({ status: "verified", verifiedBy: "Sarah Doe (simulated 2nd officer)" })}>Simulate verification by a second officer →</Btn>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRAYER & PASTORAL CARE — PRAY-01, PAST-01
// ---------------------------------------------------------------------------
function PrayerScreen({ go }) {
  const { prayers, setPrayers, genId } = useStore();
  const [creating, setCreating] = useState(false);
  const [responding, setResponding] = useState(null);
  const [f, setF] = useState({ category: "healing", description: "", privacy: "pastoral_team" });
  const [resp, setResp] = useState({ type: "note", note: "" });
  const submit = () => {
    if (!f.description) return;
    setPrayers([{ id: genId(), ...f, status: "new", by: "You", responses: [] }, ...prayers]);
    setCreating(false); setF({ category: "healing", description: "", privacy: "pastoral_team" });
  };
  const respond = () => {
    setPrayers(prayers.map((p) => p.id === responding.id ? { ...p, status: "in_prayer", responses: [...p.responses, resp] } : p));
    setResponding(null); setResp({ type: "note", note: "" });
  };
  const statusTone = { new: "info", in_prayer: "warn", follow_up_required: "danger", answered: "success", closed: "neutral" };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Prayer & Pastoral Care" onBack={() => go("home")}
        right={<button onClick={() => setCreating(true)} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}><Plus size={17} color="#fff" /></button>} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {prayers.map((p) => (
          <Card key={p.id} onClick={() => setResponding(p)}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium capitalize">{p.category}</p><p className="text-[11px]" style={{ color: C.inkSoft }}>{p.privacy.replace("_", " ")} · by {p.by}</p></div>
              <Badge tone={statusTone[p.status]}>{p.status.replace(/_/g, " ")}</Badge>
            </div>
          </Card>
        ))}
      </div>
      {creating && (
        <Modal title="Submit Prayer Request" onClose={() => setCreating(false)}>
          <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} options={["healing", "family", "financial", "spiritual", "other"]} /></Field>
          <Field label="Description *"><TextArea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Field label="Privacy level"><Select value={f.privacy} onChange={(e) => setF({ ...f, privacy: e.target.value })} options={["private", "pastoral_team", "cluster", "ministry", "public"]} /></Field>
          <Btn full onClick={submit}>Submit Request</Btn>
        </Modal>
      )}
      {responding && (
        <Modal title="Respond to Request" onClose={() => setResponding(null)}>
          <Card><p className="text-sm">{responding.description}</p></Card>
          <div className="h-2" />
          <Field label="Response type"><Select value={resp.type} onChange={(e) => setResp({ ...resp, type: e.target.value })} options={["note", "follow_up", "escalation", "praise_report"]} /></Field>
          <Field label="Response note *"><TextArea value={resp.note} onChange={(e) => setResp({ ...resp, note: e.target.value })} /></Field>
          <Btn full onClick={respond}>Submit Response</Btn>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SAFEGUARDING — SAFE-01, SAFE-02
// ---------------------------------------------------------------------------
function SafeguardingScreen({ go }) {
  const { safeguarding, setSafeguarding, genId } = useStore();
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ type: "child_safeguarding", severity: "medium", description: "" });
  const submit = () => {
    if (!f.description) return;
    setSafeguarding([{ id: genId(), ...f, status: "new", actionTaken: "" }, ...safeguarding]);
    setCreating(false); setF({ type: "child_safeguarding", severity: "medium", description: "" });
  };
  const update = (id, fields) => setSafeguarding(safeguarding.map((s) => s.id === id ? { ...s, ...fields } : s));
  const sevTone = { low: "neutral", medium: "warn", high: "danger", critical: "danger" };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Safeguarding" subtitle="Restricted — PASTOR / SYSADMIN only" onBack={() => go("home")}
        right={<button onClick={() => setCreating(true)} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}><Plus size={17} color="#fff" /></button>} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {safeguarding.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold flex items-center gap-1.5"><Lock size={12} /> Incident #{s.id}</p>
              <Badge tone={sevTone[s.severity]}>{s.severity}</Badge>
            </div>
            <p className="text-xs mb-1" style={{ color: C.inkSoft }}>{s.type.replace(/_/g, " ")} · Status: {s.status.replace(/_/g, " ")}</p>
            <p className="text-xs mb-2">{s.description}</p>
            <div className="flex gap-1.5 flex-wrap">
              <Btn small variant="ghost" onClick={() => update(s.id, { status: "under_review" })}>Under review</Btn>
              <Btn small variant="ghost" onClick={() => update(s.id, { status: "escalated" })}>Escalate</Btn>
              <Btn small variant="ghost" onClick={() => update(s.id, { status: "resolved" })}>Resolve</Btn>
            </div>
          </Card>
        ))}
      </div>
      {creating && (
        <Modal title="Report Safeguarding Incident" onClose={() => setCreating(false)}>
          <Field label="Incident type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} options={["child_safeguarding", "adult_safeguarding", "financial_abuse", "harassment", "other"]} /></Field>
          <Field label="Severity"><Select value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })} options={["low", "medium", "high", "critical"]} /></Field>
          <Field label="Description *"><TextArea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Btn full onClick={submit}>Submit Report</Btn>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRANSFERS — TRF-01, TRF-02
// ---------------------------------------------------------------------------
function TransfersScreen({ go, params }) {
  const { people, transfers, setTransfers, genId } = useStore();
  const preselect = params?.id;
  const [creating, setCreating] = useState(!!preselect);
  const [f, setF] = useState({ personId: preselect || people[0].id, to: "COP Dubai" });
  const create = () => {
    const p = people.find((x) => x.id === f.personId);
    setTransfers([{ id: genId(), personId: p.id, name: `${p.first_name} ${p.last_name}`, from: "COP Abu Dhabi", to: f.to, status: "pending_out", requested: "Today" }, ...transfers]);
    setCreating(false);
  };
  const advance = (id) => setTransfers(transfers.map((t) => t.id === id ? { ...t, status: t.status === "pending_out" ? "approved_out" : t.status === "approved_out" ? "approved_in" : "completed" } : t));
  const statusTone = { pending_out: "warn", approved_out: "info", approved_in: "info", completed: "success", rejected: "danger" };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Transfers" onBack={() => go("home")}
        right={<button onClick={() => setCreating(true)} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}><Plus size={17} color="#fff" /></button>} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {transfers.map((t) => (
          <Card key={t.id}>
            <p className="text-sm font-semibold">{t.name}</p>
            <p className="text-[11px] mb-2" style={{ color: C.inkSoft }}>{t.from} → {t.to} · requested {t.requested}</p>
            <div className="flex items-center justify-between">
              <Badge tone={statusTone[t.status]}>{t.status.replace("_", " ")}</Badge>
              {t.status !== "completed" && <Btn small variant="ghost" onClick={() => advance(t.id)}>Approve next step</Btn>}
            </div>
          </Card>
        ))}
      </div>
      {creating && (
        <Modal title="Request Transfer" onClose={() => setCreating(false)}>
          <Field label="Member"><Select value={f.personId} onChange={(e) => setF({ ...f, personId: Number(e.target.value) })} options={people.filter((p) => !p.is_child).map((p) => ({ value: p.id, label: `${p.first_name} ${p.last_name}` }))} /></Field>
          <Field label="To assembly"><Select value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} options={["COP Dubai", "COP Al Ain", "COP Ajman"]} /></Field>
          <Btn full onClick={create}>Request Transfer</Btn>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// REPORTS — REP-01
// ---------------------------------------------------------------------------
function ReportsScreen({ go }) {
  const { followups, finance, safeguarding, people } = useStore();
  const items = [
    { label: "Visitors not contacted (48h)", count: followups.filter((f) => f.task_type === "visitor_first_contact" && f.status === "open").length, to: "tasks" },
    { label: "New converts without discipleship", count: people.filter((p) => p.membership_status === "new_convert").length, to: "people" },
    { label: "Finance pending verification", count: finance.filter((f) => f.status === "pending").length, to: "finance" },
    { label: "Safeguarding cases open", count: safeguarding.filter((s) => s.status !== "resolved" && s.status !== "closed").length, to: "safeguarding" },
    { label: "Children missing consent", count: people.filter((p) => p.is_child && !p.consent).length, to: "people" },
  ];
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Exception Dashboard" onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((it) => (
          <Card key={it.label} onClick={() => go(it.to)}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{it.label}</span>
              <Badge tone={it.count > 0 ? "danger" : "success"}>{it.count}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ADMIN — ADM-01, ADM-02, ADM-03
// ---------------------------------------------------------------------------
function AdminScreen({ go }) {
  const { roleAssignments, setRoleAssignments, clusters, ministries, genId } = useStore();
  const [inviting, setInviting] = useState(false);
  const [imported, setImported] = useState(false);
  const [nf, setNf] = useState({ name: "", role: "USHER", scope: "COP Abu Dhabi" });
  const invite = () => {
    if (!nf.name) return;
    setRoleAssignments([...roleAssignments, { id: genId(), ...nf, status: "active" }]);
    setInviting(false); setNf({ name: "", role: "USHER", scope: "COP Abu Dhabi" });
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Administration" onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2"><p className="text-sm font-semibold">User & role assignments</p><Btn small onClick={() => setInviting(true)}>+ Give app access</Btn></div>
          {roleAssignments.map((r) => (
            <Card key={r.id}><p className="text-sm font-medium">{r.name}</p><p className="text-[11px]" style={{ color: C.inkSoft }}>{r.role} · {r.scope}</p></Card>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Organisation structure</p>
          <Card><p className="text-xs font-semibold mb-1">COP Abu Dhabi (Assembly)</p>
            {clusters.map((c) => <p key={c.id} className="text-xs ml-3">↳ {c.name} (Cluster)</p>)}
            {ministries.map((m) => <p key={m.id} className="text-xs ml-3">↳ {m.name} ({m.type})</p>)}
          </Card>
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Data import</p>
          <Card>
            {!imported ? (
              <>
                <p className="text-xs mb-2" style={{ color: C.inkSoft }}>Upload a CSV of existing member records.</p>
                <Btn small onClick={() => setImported(true)}>Upload members.csv (demo)</Btn>
              </>
            ) : (
              <p className="text-xs">✓ 12 records created · ⚠ 1 duplicate skipped · 0 errors</p>
            )}
          </Card>
        </div>
      </div>
      {inviting && (
        <Modal title="Give App Access" onClose={() => setInviting(false)}>
          <Field label="Name"><TextInput value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} /></Field>
          <Field label="System role"><Select value={nf.role} onChange={(e) => setNf({ ...nf, role: e.target.value })} options={["SYSADMIN", "PASTOR", "ASSEMADMIN", "CLUSTLEAD", "USHER", "FINOFF", "CHILDWORK"]} /></Field>
          <Btn full onClick={invite}>Send Invitation</Btn>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HELP — HELP-01
// ---------------------------------------------------------------------------
function HelpScreen({ go }) {
  const { feedback, setFeedback, genId } = useStore();
  const [f, setF] = useState({ type: "bug", title: "", description: "" });
  const submit = () => {
    if (!f.title) return;
    setFeedback([{ id: genId(), type: f.type, title: f.title, status: "open" }, ...feedback]);
    setF({ type: "bug", title: "", description: "" });
  };
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Help & Feedback" onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold mb-2">My feedback</p>
          {feedback.map((it) => <Card key={it.id}><p className="text-sm font-medium">{it.title}</p><p className="text-[11px]" style={{ color: C.inkSoft }}>{it.type} · {it.status}</p></Card>)}
        </div>
        <div>
          <p className="text-sm font-semibold mb-2">Submit feedback</p>
          <Field label="Type"><Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} options={["bug", "improvement", "question", "other"]} /></Field>
          <Field label="Title *"><TextInput value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Description"><TextArea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <Btn full onClick={submit}>Submit Feedback</Btn>
        </div>
      </div>
    </div>
  );
}

function NotifScreen({ go }) {
  return (
    <div className="h-full flex flex-col" style={{ background: C.bg }}>
      <Header title="Notifications" onBack={() => go("home")} />
      <div className="p-4 space-y-2">
        <Card><p className="text-sm">New visitor follow-up assigned</p></Card>
        <Card><p className="text-sm">Transfer request submitted</p></Card>
        <Card><p className="text-sm">Prayer request needs a response</p></Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
function Modal({ title, onClose, children }) {
  return (
    <div className="absolute inset-0 flex items-end z-20" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-2xl p-4 max-h-[85%] overflow-y-auto" style={{ background: C.surface }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">{title}</h2>
          <button onClick={onClose}><X size={18} color={C.inkSoft} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
const SCREENS = {
  home: DashboardScreen, notif: NotifScreen,
  people: PeopleListScreen, "ppl-add": PplAddScreen, "ppl-profile": PplProfileScreen,
  "ppl-role": PplRoleScreen, "ppl-status": PplStatusScreen, "disc-assign": DiscAssignScreen,
  "hh-list": HhListScreen, "child-register": ChildRegisterScreen,
  "vis-add": VisAddScreen, tasks: TasksScreen,
  clusters: ClustersScreen, ministries: MinistriesScreen,
  events: EventsScreen, "att-qr": AttQrScreen, "att-self": AttSelfScreen, "att-checkin": AttCheckinScreen,
  finance: FinanceScreen, "fin-detail": FinDetailScreen,
  prayer: PrayerScreen, safeguarding: SafeguardingScreen,
  transfers: TransfersScreen, "trf-request": TransfersScreen,
  reports: ReportsScreen, admin: AdminScreen, help: HelpScreen,
};

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "people", label: "People", icon: Users },
  { id: "att-checkin", label: "Check-in", icon: QrCode },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "admin", label: "More", icon: MoreHorizontal },
];

function AppShell() {
  const [nav, setNav] = useState({ screen: "home", params: {} });
  const { online, setOnline, syncQueue } = useStore();
  const go = (screen, params = {}) => setNav({ screen, params });
  const Screen = SCREENS[nav.screen] || DashboardScreen;

  return (
    <div className="h-full flex flex-col relative" style={{ background: C.bg }}>
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <Screen go={go} params={nav.params} />
      </div>
      <button onClick={() => setOnline(!online)} className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium z-10"
        style={{ background: online ? C.successBg : C.dangerBg, color: online ? "#166534" : "#991B1B" }}>
        {online ? <Wifi size={11} /> : <WifiOff size={11} />} {online ? "Online" : "Offline"}
      </button>
      <div className="flex items-stretch justify-between px-2 pt-1.5 pb-1" style={{ borderTop: `1px solid ${C.line}`, background: C.surface }}>
        {TABS.map((t) => {
          const active = nav.screen === t.id;
          return (
            <button key={t.id} onClick={() => go(t.id)} className="flex-1 flex flex-col items-center gap-0.5 py-1">
              <t.icon size={19} color={active ? C.gradStart : C.inkSoft} strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[9px] font-medium" style={{ color: active ? C.gradStart : C.inkSoft }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4" style={{ background: "#0A0F1A", fontFamily: "Inter, sans-serif" }}>
      <style>{FONT}</style>
      <p className="text-[11px] mb-4" style={{ color: C.gold }}>COP GCC Connect — Abu Dhabi Beta Demo (all 35 P0 stories)</p>
      <div className="relative w-[390px] h-[800px] rounded-[42px] p-3" style={{ background: "#0F0C0B" }}>
        <div className="w-full h-full rounded-[30px] overflow-hidden relative" style={{ background: C.bg }}>
          <StoreProvider>
            {loggedIn ? <AppShell /> : <LoginScreen onLogin={() => setLoggedIn(true)} />}
          </StoreProvider>
        </div>
      </div>
      <p className="text-[10px] mt-4 max-w-[390px] text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
        Demo only — data resets on refresh, no backend. Log in with admin / admin123 to explore all modules from Home.
      </p>
    </div>
  );
}