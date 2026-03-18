import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  Database,
  FlaskConical,
  Code,
  Home
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Data Upload", href: "/data-upload", icon: Database },
  { name: "Model Training", href: "/model-training", icon: Brain },
  { name: "Code Prediction", href: "/code-prediction", icon: Code },
];

export default function SidebarNav() {
  const [location] = useLocation();

  return (
    <aside className="w-72 border-r border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#eef4fb_100%)] shadow-[inset_-1px_0_0_rgba(255,255,255,0.7)]">
      <div className="border-b border-slate-200/80 px-6 py-7">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
          Research Suite
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">ML Research</h1>
            <p className="text-sm text-slate-500">Reliability analytics platform</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Train, compare, and monitor software reliability models from one workspace.
        </p>
      </div>
      
      <nav className="px-4 py-6">
        <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Workspace
        </div>
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                        : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                        isActive
                          ? "border-white/15 bg-white/10 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-300 group-hover:bg-slate-100 group-hover:text-slate-950"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div>{item.name}</div>
                    </div>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
