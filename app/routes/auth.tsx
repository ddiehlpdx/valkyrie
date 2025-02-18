import { Outlet } from "@remix-run/react";

export default function Auth() {
    return (
        <div id="auth" className="flex h-screen items-center justify-center">
            <Outlet />
        </div>
    );
}