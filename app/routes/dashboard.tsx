import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getSession } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('userId')) {
    return redirect('/auth/sign-in');
  }

  return null;
}

export default function Dashboard() {
  return (
      <div id="dashboard" className="flex h-screen items-center justify-center">
          <Outlet />
      </div>
  );
}