import {useEffect, useState} from "react";
import {LogOut, Moon, Sun, Menu} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {Sheet, SheetContent, SheetTrigger, SheetTitle} from "@/components/ui/sheet";
import {ConfirmDialog} from "@/components/ConfirmDialog";
import {SidebarContent} from "./Sidebar";
import {useTheme} from "@/hooks/use-theme";
import {format} from "date-fns";
import {useAuth} from "../features/auth/hooks/useAuth";

export function Topbar() {
    const {theme, toggleTheme} = useTheme();
    const {admin, logout} = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sheetOpen, setSheetOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    // derive up to two initials from the admin name for the profile box
    const initials = admin?.name
        ? admin.name
            .split(" ")
            .filter(Boolean)
            .map((s) => s[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "?";

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex items-center gap-3">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                                <Menu className="h-5 w-5"/>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <SheetTitle className="sr-only">Navigation</SheetTitle>
                            <SidebarContent onNavigate={() => setSheetOpen(false)}/>
                        </SheetContent>
                    </Sheet>
                    <div className="hidden min-w-0 text-left md:block">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground"
                                aria-hidden
                            >
                                {initials}
                            </div>
                            <div className="flex flex-col leading-none" aria-hidden="true">
                                <p className="text-xs text-muted-foreground">Welcome</p>
                                <p className="max-w-40 truncate text-sm font-medium">{admin?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <time className="hidden sm:block text-sm text-muted-foreground tabular-nums" dateTime={currentTime.toISOString()}>
                        {format(currentTime, "EEE, MMM d · HH:mm:ss")}
                    </time>
                    <Separator orientation="vertical" className="h-5 hidden sm:block"/>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === "dark" ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setLogoutDialogOpen(true)} aria-label="Sign out">
                        <LogOut className="h-4 w-4"/>
                    </Button>
                </div>
            </header>
            <ConfirmDialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
                title="Sign out?"
                description="Are you sure you want to sign out?"
                confirmLabel="Sign out"
                cancelLabel="Cancel"
                variant="destructive"
                onConfirm={logout}
            />
        </>
    );
}
