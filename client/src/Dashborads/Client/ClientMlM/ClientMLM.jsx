
// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { useAuth } from "../../../context/auth/AuthUser";
// import { useTheme } from "../../../context/ThemeProvider";
// import { RefreshCw, ChevronDown, ChevronRight, UserCircle2 } from "lucide-react";

// // >>> Keep these synced with backend <<<
// const LEVEL_REQUIREMENTS = [
//   100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400, 204800,
// ];
// const MLM_COMMISSIONS = [8, 3, 2, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];

// const currency = (n) =>
//   `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

// // Local cache helpers
// const cacheSet = (key, data) => {
//   try {
//     localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
//   } catch {}
// };
// const cacheGet = (key, ttl = 5 * 60 * 1000) => {
//   try {
//     const raw = localStorage.getItem(key);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     if (!parsed?.ts) return null;
//     if (Date.now() - parsed.ts > ttl) {
//       localStorage.removeItem(key);
//       return null;
//     }
//     return parsed.data;
//   } catch {
//     return null;
//   }
// };

// // Normalize tree
// function normalizeTree(node) {
//   if (!node || typeof node !== "object") return node;
//   const kids = node.children || node.referrals || [];
//   return { ...node, children: Array.isArray(kids) ? kids.map(normalizeTree) : [] };
// }

// // Collect by depth
// function collectByDepth(root) {
//   const byDepth = {};
//   const sums = {};
//   if (!root) return { byDepth, sums };
//   const queue = [{ node: root, depth: 0 }];
//   while (queue.length) {
//     const { node, depth } = queue.shift();
//     const children = node.children || node.referrals || [];
//     children.forEach((ch) => {
//       const d = depth + 1;
//       if (!byDepth[d]) byDepth[d] = [];
//       if (!sums[d]) sums[d] = 0;
//       byDepth[d].push(ch);
//       const inv = Number(ch?.wallets?.investment || 0);
//       sums[d] += inv;
//       queue.push({ node: ch, depth: d });
//     });
//   }
//   Object.keys(sums).forEach((k) => (sums[k] = Number(sums[k].toFixed(8))));
//   return { byDepth, sums };
// }

// // Pill
// const Pill = ({ label, tone = "slate" }) => (
//   <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${tone}-100 text-${tone}-800`}>
//     {label}
//   </span>
// );

// // User Item
// function UserItem({ u, darkMode }) {
//   const inv = Number(u?.wallets?.investment || 0);
//   return (
//     <div
//       className={`flex items-center justify-between p-2 rounded-xl border ${
//         darkMode ? "border-slate-700" : "border-slate-200"
//       }`}
//     >
//       <div className="flex items-center gap-2">
//         {u.profileImage ? (
//           <img src={u.profileImage} alt={u.name || u._id} className="w-8 h-8 rounded-full object-cover" />
//         ) : (
//           <UserCircle2
//             className={`w-8 h-8 text-blue-500 p-0.5 rounded-full ${
//               darkMode ? "bg-slate-800" : "bg-blue-50"
//             }`}
//           />
//         )}
//         <div>
//           <div className="text-sm font-medium">{u.name || u.customId || u._id}</div>
//           <div className="text-xs opacity-70">{u.email || "-"}</div>
//         </div>
//       </div>
//       <div className="text-sm font-semibold">{currency(inv)}</div>
//     </div>
//   );
// }

// // Level Panel
// function LevelPanel({ lvl, req, pct, unlocked, teamAmount, members, highlightFirstThree, darkMode }) {
//   const [open, setOpen] = useState(lvl === 1);
//   return (
//     <div
//       className={`rounded-2xl border overflow-hidden ${
//         darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
//       }`}
//     >
//       <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3">
//         <div className="flex items-center gap-3">
//           {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
//           <div className="text-left">
//             <div className="text-sm opacity-80">
//               Level {lvl} • Requires {currency(req)}
//             </div>
//             <div className="text-xs opacity-70">
//               Commission {pct}% • Team Business {currency(teamAmount || 0)}
//             </div>
//           </div>
//         </div>
//         <Pill label={unlocked ? "Unlocked" : "Locked"} tone={unlocked ? "green" : "yellow"} />
//       </button>

//       {open && (
//         <div className="px-4 pb-4 space-y-3">
//           {lvl === 1 && (
//             <div
//               className={`text-xs p-3 rounded-xl border ${
//                 darkMode ? "border-slate-700" : "border-slate-200"
//               }`}
//             >
//               To unlock L1: need 3 directs and minimum $100 (either 3 × $100 each or combined).
//             </div>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {members && members.length ? (
//               members.map((u) => (
//                 <div
//                   key={u._id}
//                   className={`${lvl === 1 && highlightFirstThree.includes(u._id) ? "ring-2 ring-blue-400" : ""} rounded-xl`}
//                 >
//                   <UserItem u={u} darkMode={darkMode} />
//                 </div>
//               ))
//             ) : (
//               <div className="text-sm opacity-70">No members at this depth yet.</div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Tree Node
// function TreeNode({ node, depth = 0, darkMode }) {
//   const kids = node?.children || [];
//   return (
//     <div className="relative pl-5">
//       {depth > 0 && (
//         <>
//           <div className={`absolute left-0 top-0 h-full border-l ${darkMode ? "border-slate-600" : "border-slate-300"}`} />
//           <div className={`absolute left-0 top-3 w-4 border-t ${darkMode ? "border-slate-600" : "border-slate-300"}`} />
//         </>
//       )}

//       <div
//         className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm mb-2 ${
//           darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
//         }`}
//       >
//         <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
//         <span className="text-sm font-medium">{node?.name || node?.customId || node?._id}</span>
//       </div>

//       <div className="pl-4">
//         {kids.map((k) => (
//           <TreeNode key={k._id} node={k} depth={depth + 1} darkMode={darkMode} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function ClientMlmOverview() {
//   const { authorizationToken, user } = useAuth();
//   const { darkMode } = useTheme();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [tree, setTree] = useState(null);
//   const [levelBusiness, setLevelBusiness] = useState(null);
//   const [personalInvestment, setPersonalInvestment] = useState(0);
//   const cacheKey = `mlmTree:v2:${user?._id || "anon"}`;

//   const fetchTree = useCallback(
//     async (signal, force = false) => {
//       setLoading(true);
//       try {
//         if (!force) {
//           const cached = cacheGet(cacheKey, 5 * 60 * 1000);
//           if (cached?.success && cached?.tree) {
//             const normalized = normalizeTree(cached.tree);
//             setTree(normalized);
//             setLevelBusiness(normalized.levelBusiness || null);
//             setPersonalInvestment(normalized.personalInvestment || user?.wallets?.investment || 0);
//             setLoading(false);
//             return;
//           }
//         }

//         const { data } = await axios.get(
//           `${import.meta.env.VITE_API_URL}/api/admin/mlm-tree/${user._id}`,
//           { headers: { Authorization: authorizationToken }, signal }
//         );

//         if (data?.success && data?.tree) {
//           const normalized = normalizeTree(data.tree);
//           setTree(normalized);
//           setLevelBusiness(normalized.levelBusiness || null);
//           setPersonalInvestment(normalized.personalInvestment || user?.wallets?.investment || 0);
//           cacheSet(cacheKey, { ...data, tree: normalized });
//         } else {
//           setTree(null);
//           setLevelBusiness(null);
//           toast.error("Could not load MLM tree.");
//         }
//       } catch (e) {
//         if (!axios.isCancel(e)) {
//           console.error(e);
//           toast.error("Failed to load MLM data.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     },
//     [authorizationToken, user?._id]
//   );

//   useEffect(() => {
//     if (!user?._id) return;
//     const ctrl = new AbortController();
//     fetchTree(ctrl.signal);
//     return () => ctrl.abort();
//   }, [fetchTree, user?._id]);

//   const depthData = useMemo(() => {
//     if (!tree) return { byDepth: {}, sums: {} };
//     return collectByDepth(tree);
//   }, [tree]);

//   const effectiveLevelBusiness = levelBusiness || depthData.sums;
//   const firstLevelMembers = depthData.byDepth[1] || [];
//   const directsCount = firstLevelMembers.length;
//   const directSum = firstLevelMembers.reduce((s, d) => s + Number(d?.wallets?.investment || 0), 0);
//   const directsWith100 = firstLevelMembers.filter((d) => Number(d?.wallets?.investment || 0) >= 100).length;

//   const topThreeDirectIds = useMemo(
//     () =>
//       firstLevelMembers
//         .slice()
//         .sort((a, b) => Number(b?.wallets?.investment || 0) - Number(a?.wallets?.investment || 0))
//         .slice(0, 3)
//         .map((x) => x._id),
//     [firstLevelMembers]
//   );

//   const personalLevel = useMemo(() => {
//     const inv = Number(tree?.personalInvestment || personalInvestment || 0);
//     let lvl = 0;
//     for (let i = 0; i < LEVEL_REQUIREMENTS.length; i++) {
//       if (inv >= LEVEL_REQUIREMENTS[i]) lvl = i + 1;
//       else break;
//     }
//     return lvl;
//   }, [tree?.personalInvestment, personalInvestment]);

//   const { levelStatus, highestTeamEligible, criteriaMetForL1 } = useMemo(() => {
//     const lb = effectiveLevelBusiness || {};
//     const status = {};
//     const requiredL1 = LEVEL_REQUIREMENTS[0];
//     const activeL1 = Number(lb?.[1] || 0);
//     const has3 = directsCount >= 3;
//     const eachThree100 = directsWith100 >= 3;
//     const combined100 = directSum >= 100;
//     const depthHas100 = activeL1 >= requiredL1;
//     const l1criteria = has3 && depthHas100 && (eachThree100 || combined100);
//     status[1] = { required: requiredL1, active: activeL1, unlocked: true, criteriaMet: l1criteria };

//     if (!l1criteria) {
//       for (let i = 1; i < LEVEL_REQUIREMENTS.length; i++) {
//         const lvl = i + 1;
//         status[lvl] = { required: LEVEL_REQUIREMENTS[i], active: Number(lb?.[lvl] || 0), unlocked: false };
//       }
//       return { levelStatus: status, highestTeamEligible: 0, criteriaMetForL1: l1criteria };
//     }

//     status[2] = { required: LEVEL_REQUIREMENTS[1], active: Number(lb?.[2] || 0), unlocked: true };
//     let highest = 2;

//     for (let levelNum = 3; levelNum <= LEVEL_REQUIREMENTS.length; levelNum++) {
//       const prevDepth = levelNum - 1;
//       const prevRequired = LEVEL_REQUIREMENTS[levelNum - 2];
//       const prevActive = Number(lb?.[prevDepth] || 0);
//       const unlocked = prevActive >= prevRequired;
//       status[levelNum] = { required: LEVEL_REQUIREMENTS[levelNum - 1], active: Number(lb?.[levelNum] || 0), unlocked };
//       if (!unlocked) break;
//       highest = levelNum;
//     }

//     return { levelStatus: status, highestTeamEligible: highest, criteriaMetForL1: l1criteria };
//   }, [effectiveLevelBusiness, directsCount, directsWith100, directSum]);

//   const isLevelUnlockedInUI = useCallback(
//     (lvl) => {
//       if (lvl === 1) return true;
//       if (!criteriaMetForL1) return false;
//       return lvl <= highestTeamEligible;
//     },
//     [criteriaMetForL1, highestTeamEligible]
//   );

//   const teamEligibleForDisplay = Math.max(1, highestTeamEligible || 1);
//   const effectiveLevelForUI = Math.max(1, Math.min(personalLevel || 1, teamEligibleForDisplay));

//   const refresh = async () => {
//     setRefreshing(true);
//     try {
//       await fetchTree(undefined, true);
//       toast.success("Refreshed");
//     } catch {
//       toast.error("Refresh failed");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const totals = useMemo(() => {
//     const allMembers = Object.values(depthData.byDepth).flat();
//     return {
//       totalPartners: allMembers.length,
//       totalActive: allMembers.filter((m) => Number(m?.wallets?.investment || 0) > 0).length,
//       totalTeamBusiness: Object.values(effectiveLevelBusiness || {}).reduce((s, v) => s + Number(v || 0), 0),
//     };
//   }, [depthData.byDepth, effectiveLevelBusiness]);

//   return (
//     <div className={`p-6 min-h-[70vh] ${darkMode ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"}`}>
//       <div className="max-w-7xl mx-auto">
//         <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
//           <div>
//             <h1 className="text-2xl font-bold">MLM Overview</h1>
//             <p className="text-sm opacity-80 mt-1">Levels, commissions and your downline tree — synced with backend rules.</p>
//             <div className="mt-3 text-sm flex flex-wrap items-center gap-3">
//               <div>Personal Investment: <strong>{currency(tree?.personalInvestment || personalInvestment)}</strong></div>
//               <div>Personal Level: <strong>Lv {personalLevel}</strong></div>
//               <div>Team Eligible Level: <strong>Lv {teamEligibleForDisplay}</strong></div>
//               <div>Effective Level (UI): <strong>Lv {effectiveLevelForUI}</strong></div>
//             </div>
//             <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
//               {[
//                 { label: "Total Partners", value: totals.totalPartners },
//                 { label: "Total Active", value: totals.totalActive },
//                 { label: "Total Team Business", value: currency(totals.totalTeamBusiness) },
//               ].map((stat, idx) => (
//                 <div
//                   key={idx}
//                   className={`rounded-2xl p-3 border shadow-sm ${
//                     darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
//                   }`}
//                 >
//                   <div className="text-xs opacity-80">{stat.label}</div>
//                   <div className="text-lg font-semibold mt-1">{stat.value}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={refresh}
//               disabled={refreshing}
//               className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium shadow-sm border ${
//                 darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
//               }`}
//             >
//               <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
//               {refreshing ? "Refreshing..." : "Refresh"}
//             </button>
//           </div>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-13 gap-6">
//           <section className="lg:col-span-9 space-y-4">
//             <div
//               className={`rounded-2xl p-4 border ${
//                 darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
//               }`}
//             >
//               <h2 className="text-lg font-semibold mb-3">Level Commission Log</h2>
//               <div className="grid grid-cols-1 gap-3">
//                 {LEVEL_REQUIREMENTS.map((req, idx) => {
//                   const lvl = idx + 1;
//                   const pct = MLM_COMMISSIONS[idx] || 0;
//                   const members = depthData.byDepth[lvl] || [];
//                   return (
//                     <LevelPanel
//                       key={lvl}
//                       lvl={lvl}
//                       req={req}
//                       pct={pct}
//                       unlocked={isLevelUnlockedInUI(lvl)}
//                       teamAmount={effectiveLevelBusiness?.[lvl] || 0}
//                       members={members}
//                       highlightFirstThree={topThreeDirectIds}
//                       darkMode={darkMode}
//                     />
//                   );
//                 })}
//               </div>
//             </div>
//           </section>

//           <aside className="lg:col-span-4">
//             <div
//               className={`rounded-2xl p-4 border ${
//                 darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
//               }`}
//             >
//               <h2 className="text-lg font-semibold mb-3">Your Downline Tree</h2>
//               {tree ? (
//                 <div className="overflow-auto max-h-[70vh] pr-2">
//                   <TreeNode node={tree} darkMode={darkMode} />
//                 </div>
//               ) : loading ? (
//                 <div className="text-sm opacity-70">Loading...</div>
//               ) : (
//                 <div className="text-sm opacity-70">No tree data found.</div>
//               )}
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }




// ClientMLM.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../../context/auth/AuthUser";
import { useTheme } from "../../../context/ThemeProvider";
import { RefreshCw, ChevronDown, ChevronRight, UserCircle2 } from "lucide-react";

// >>> Keep these synced with backend <<<
const LEVEL_REQUIREMENTS = [
  100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400, 204800,
];
const MLM_COMMISSIONS = [8, 3, 2, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];

const currency = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

// Local cache helpers
const cacheSet = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
};
const cacheGet = (key, ttl = 5 * 60 * 1000) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts) return null;
    if (Date.now() - parsed.ts > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};

// Normalize tree
function normalizeTree(node) {
  if (!node || typeof node !== "object") return node;
  const kids = node.children || node.referrals || [];
  return { ...node, children: Array.isArray(kids) ? kids.map(normalizeTree) : [] };
}

// Collect by depth
function collectByDepth(root) {
  const byDepth = {};
  const sums = {};
  if (!root) return { byDepth, sums };
  const queue = [{ node: root, depth: 0 }];
  while (queue.length) {
    const { node, depth } = queue.shift();
    const children = node.children || node.referrals || [];
    children.forEach((ch) => {
      const d = depth + 1;
      if (!byDepth[d]) byDepth[d] = [];
      if (!sums[d]) sums[d] = 0;
      byDepth[d].push(ch);
      const inv = Number(ch?.wallets?.investment || 0);
      sums[d] += inv;
      queue.push({ node: ch, depth: d });
    });
  }
  Object.keys(sums).forEach((k) => (sums[k] = Number(sums[k].toFixed(8))));
  return { byDepth, sums };
}

// Pill
const Pill = ({ label, tone = "slate" }) => (
  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${tone}-100 text-${tone}-800`}>
    {label}
  </span>
);

// User Item
function UserItem({ u, darkMode }) {
  const inv = Number(u?.wallets?.investment || 0);
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-xl border ${
        darkMode ? "border-slate-700" : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2">
        {u.profileImage ? (
          <img src={u.profileImage} alt={u.name || u._id} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <UserCircle2
            className={`w-8 h-8 text-blue-500 p-0.5 rounded-full ${
              darkMode ? "bg-slate-800" : "bg-blue-50"
            }`}
          />
        )}
        <div>
          <div className="text-sm font-medium">{u.name || u.customId || u._id}</div>
          <div className="text-xs opacity-70">{u.email || "-"}</div>
        </div>
      </div>
      <div className="text-sm font-semibold">{currency(inv)}</div>
    </div>
  );
}

// Level Panel
function LevelPanel({ lvl, req, pct, unlocked, teamAmount, members, highlightFirstThree, darkMode }) {
  const [open, setOpen] = useState(lvl === 1);
  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
      }`}
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <div className="text-left">
            <div className="text-sm opacity-80">
              Level {lvl} • Requires {currency(req)}
            </div>
            <div className="text-xs opacity-70">
              Commission {pct}% • Team Business {currency(teamAmount || 0)}
            </div>
          </div>
        </div>
        <Pill label={unlocked ? "Unlocked" : "Locked"} tone={unlocked ? "green" : "yellow"} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {lvl === 1 && (
            <div
              className={`text-xs p-3 rounded-xl border ${
                darkMode ? "border-slate-700" : "border-slate-200"
              }`}
            >
              To unlock Level 2: you must have 3 directs, all active, and depth-1 business ≥ $100.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members && members.length ? (
              members.map((u) => (
                <div
                  key={u._id}
                  className={`${lvl === 1 && highlightFirstThree.includes(u._id) ? "ring-2 ring-blue-400" : ""} rounded-xl`}
                >
                  <UserItem u={u} darkMode={darkMode} />
                </div>
              ))
            ) : (
              <div className="text-sm opacity-70">No members at this depth yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Tree Node
function TreeNode({ node, depth = 0, darkMode }) {
  const kids = node?.children || [];
  return (
    <div className="relative pl-5">
      {depth > 0 && (
        <>
          <div className={`absolute left-0 top-0 h-full border-l ${darkMode ? "border-slate-600" : "border-slate-300"}`} />
          <div className={`absolute left-0 top-3 w-4 border-t ${darkMode ? "border-slate-600" : "border-slate-300"}`} />
        </>
      )}

      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm mb-2 ${
          darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        <span className="text-sm font-medium">{node?.name || node?.customId || node?._id}</span>
      </div>

      <div className="pl-4">
        {kids.map((k) => (
          <TreeNode key={k._id} node={k} depth={depth + 1} darkMode={darkMode} />
        ))}
      </div>
    </div>
  );
}

export default function ClientMlmOverview() {
  const { authorizationToken, user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tree, setTree] = useState(null);
  const [levelBusiness, setLevelBusiness] = useState(null);
  const [personalInvestment, setPersonalInvestment] = useState(0);
  const cacheKey = `mlmTree:v2:${user?._id || "anon"}`;

  const fetchTree = useCallback(
    async (signal, force = false) => {
      setLoading(true);
      try {
        if (!force) {
          const cached = cacheGet(cacheKey, 5 * 60 * 1000);
          if (cached?.success && cached?.tree) {
            const normalized = normalizeTree(cached.tree);
            setTree(normalized);
            setLevelBusiness(normalized.levelBusiness || null);
            setPersonalInvestment(normalized.personalInvestment || user?.wallets?.investment || 0);
            setLoading(false);
            return;
          }
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/mlm-tree/${user._id}`,
          { headers: { Authorization: authorizationToken }, signal }
        );

        if (data?.success && data?.tree) {
          const normalized = normalizeTree(data.tree);
          setTree(normalized);
          setLevelBusiness(normalized.levelBusiness || null);
          setPersonalInvestment(normalized.personalInvestment || user?.wallets?.investment || 0);
          cacheSet(cacheKey, { ...data, tree: normalized });
        } else {
          setTree(null);
          setLevelBusiness(null);
          toast.error("Could not load MLM tree.");
        }
      } catch (e) {
        if (!axios.isCancel(e)) {
          console.error(e);
          toast.error("Failed to load MLM data.");
        }
      } finally {
        setLoading(false);
      }
    },
    [authorizationToken, user?._id]
  );

  useEffect(() => {
    if (!user?._id) return;
    const ctrl = new AbortController();
    fetchTree(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchTree, user?._id]);

  const depthData = useMemo(() => {
    if (!tree) return { byDepth: {}, sums: {} };
    return collectByDepth(tree);
  }, [tree]);

  const effectiveLevelBusiness = levelBusiness || depthData.sums;
  const firstLevelMembers = depthData.byDepth[1] || [];
  const directsCount = firstLevelMembers.length;
  const activeDirectsCount = firstLevelMembers.filter((d) => Number(d?.wallets?.investment || 0) > 0).length;
  const directSum = firstLevelMembers.reduce((s, d) => s + Number(d?.wallets?.investment || 0), 0);

  const topThreeDirectIds = useMemo(
    () =>
      firstLevelMembers
        .slice()
        .sort((a, b) => Number(b?.wallets?.investment || 0) - Number(a?.wallets?.investment || 0))
        .slice(0, 3)
        .map((x) => x._id),
    [firstLevelMembers]
  );

  const personalLevel = useMemo(() => {
    const inv = Number(tree?.personalInvestment || personalInvestment || 0);
    let lvl = 0;
    for (let i = 0; i < LEVEL_REQUIREMENTS.length; i++) {
      if (inv >= LEVEL_REQUIREMENTS[i]) lvl = i + 1;
      else break;
    }
    return lvl;
  }, [tree?.personalInvestment, personalInvestment]);

  const { levelStatus, highestTeamEligible, criteriaMetForL1 } = useMemo(() => {
    const lb = effectiveLevelBusiness || {};
    const status = {};
    const requiredL1 = LEVEL_REQUIREMENTS[0];
    const activeL1 = Number(lb?.[1] || 0);

    const has3 = directsCount >= 3;
    const has3Active = activeDirectsCount >= 3;
    const depthHas100 = activeL1 >= requiredL1;

    const l1criteria = has3 && has3Active && depthHas100;

    status[1] = { required: requiredL1, active: activeL1, unlocked: true, criteriaMet: l1criteria };

    if (!l1criteria) {
      for (let i = 1; i < LEVEL_REQUIREMENTS.length; i++) {
        const lvl = i + 1;
        status[lvl] = { required: LEVEL_REQUIREMENTS[i], active: Number(lb?.[lvl] || 0), unlocked: false };
      }
      return { levelStatus: status, highestTeamEligible: 0, criteriaMetForL1: l1criteria };
    }

    status[2] = { required: LEVEL_REQUIREMENTS[1], active: Number(lb?.[2] || 0), unlocked: true };
    let highest = 2;

    for (let levelNum = 3; levelNum <= LEVEL_REQUIREMENTS.length; levelNum++) {
      const prevDepth = levelNum - 1;
      const prevRequired = LEVEL_REQUIREMENTS[levelNum - 2];
      const prevActive = Number(lb?.[prevDepth] || 0);
      const unlocked = prevActive >= prevRequired;
      status[levelNum] = { required: LEVEL_REQUIREMENTS[levelNum - 1], active: Number(lb?.[levelNum] || 0), unlocked };
      if (!unlocked) break;
      highest = levelNum;
    }

    return { levelStatus: status, highestTeamEligible: highest, criteriaMetForL1: l1criteria };
  }, [effectiveLevelBusiness, directsCount, activeDirectsCount]);

  const isLevelUnlockedInUI = useCallback(
    (lvl) => {
      if (lvl === 1) return true;
      if (!criteriaMetForL1) return false;
      return lvl <= highestTeamEligible;
    },
    [criteriaMetForL1, highestTeamEligible]
  );

  const teamEligibleForDisplay = Math.max(1, highestTeamEligible || 1);
  const effectiveLevelForUI = Math.max(1, Math.min(personalLevel || 1, teamEligibleForDisplay));

  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetchTree(undefined, true);
      toast.success("Refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const totals = useMemo(() => {
    const allMembers = Object.values(depthData.byDepth).flat();
    return {
      totalPartners: allMembers.length,
      totalActive: allMembers.filter((m) => Number(m?.wallets?.investment || 0) > 0).length,
      totalTeamBusiness: Object.values(effectiveLevelBusiness || {}).reduce((s, v) => s + Number(v || 0), 0),
    };
  }, [depthData.byDepth, effectiveLevelBusiness]);

  return (
    <div className={`p-6 min-h-[70vh] ${darkMode ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"}`}>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">MLM Overview</h1>
            <p className="text-sm opacity-80 mt-1">Levels, commissions and your downline tree — synced with backend rules.</p>
            <div className="mt-3 text-sm flex flex-wrap items-center gap-3">
              <div>Personal Investment: <strong>{currency(tree?.personalInvestment || personalInvestment)}</strong></div>
              <div>Personal Level: <strong>Lv {personalLevel}</strong></div>
              <div>Team Eligible Level: <strong>Lv {teamEligibleForDisplay}</strong></div>
              <div>Effective Level (UI): <strong>Lv {effectiveLevelForUI}</strong></div>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Total Partners", value: totals.totalPartners },
                { label: "Total Active", value: totals.totalActive },
                { label: "Total Team Business", value: currency(totals.totalTeamBusiness) },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-3 border shadow-sm ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="text-xs opacity-80">{stat.label}</div>
                  <div className="text-lg font-semibold mt-1">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={refreshing}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium shadow-sm border ${
                darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-13 gap-6">
          <section className="lg:col-span-9 space-y-4">
            <div
              className={`rounded-2xl p-4 border ${
                darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <h2 className="text-lg font-semibold mb-3">Level Commission Log</h2>
              <div className="grid grid-cols-1 gap-3">
                {LEVEL_REQUIREMENTS.map((req, idx) => {
                  const lvl = idx + 1;
                  const pct = MLM_COMMISSIONS[idx] || 0;
                  const members = depthData.byDepth[lvl] || [];
                  return (
                    <LevelPanel
                      key={lvl}
                      lvl={lvl}
                      req={req}
                      pct={pct}
                      unlocked={isLevelUnlockedInUI(lvl)}
                      teamAmount={effectiveLevelBusiness?.[lvl] || 0}
                      members={members}
                      highlightFirstThree={topThreeDirectIds}
                      darkMode={darkMode}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div
              className={`rounded-2xl p-4 border ${
                darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <h2 className="text-lg font-semibold mb-3">Your Downline Tree</h2>
              {tree ? (
                <div className="overflow-auto max-h-[70vh] pr-2">
                  <TreeNode node={tree} darkMode={darkMode} />
                </div>
              ) : loading ? (
                <div className="text-sm opacity-70">Loading...</div>
              ) : (
                <div className="text-sm opacity-70">No tree data found.</div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
