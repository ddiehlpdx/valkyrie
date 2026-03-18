import { redirect, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { getSession } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Valkyrie" },
    { name: "description", content: "Welcome to Valkyrie!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('userId')) {
    return redirect('/auth/sign-in');
  }

  return redirect('/dashboard');
}

export default function Index() {
  return null;
}
