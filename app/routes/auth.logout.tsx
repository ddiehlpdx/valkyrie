import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  
  return redirect('/auth/sign-in', {
    headers: {
      'Set-Cookie': await destroySession(session)
    }
  });
}

export async function loader() {
  return redirect('/auth/sign-in');
}