import { Home, Compass, PlusCircle, ShieldCheck, History, Bookmark } from "lucide-react";

export const NAV_ITEMS = [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse", href: "/browse", icon: Compass },
    { name: "Library", href: "/library", icon: Bookmark },
    { name: "Submit", href: "/submit", icon: PlusCircle },
];

export const ADMIN_ITEMS = [
    { name: "Admin Panel", href: "/admin", icon: ShieldCheck },
    { name: "Audit Log", href: "/audit", icon: History },
];
