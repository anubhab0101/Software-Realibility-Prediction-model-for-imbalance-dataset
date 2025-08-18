import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  Database,
  FlaskConical,
  Atom,
  Network,
  Monitor,
  Home
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Data Upload", href: "/data-upload", icon: Database },
  { name: "Model Training", href: "/model-training", icon: Brain },
  { name: "Quantum Lab", href: "/quantum-lab", icon: Atom },
  { name: "Federated Learning", href: "/federated-learning", icon: Network },
  { name: "Monitoring", href: "/monitoring", icon: Monitor },
];

export default function SidebarNav() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">ML Research Platform</h1>
        </div>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
