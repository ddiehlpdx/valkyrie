import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSession, commitSession } from "~/session.server";
import { signIn } from "~/api/user";
import SignInForm from "~/components/auth/sign-in-form";
import ErrorBoundaryLayout from "~/components/shared/error-boundary.layout";

export function meta() {
    return [{
        title: 'Sign In',
        description: 'Sign in to your Valkyrie account.',
    }];
}

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
  
    if (session.has('userId')) {
      return redirect('/dashboard');
    }

    return { error: session.get('error') };
}

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const formData = await request.formData();

    const emailOrUsername = formData.get('emailOrUsername') as string;
    const password = formData.get('password') as string;

    const user = await signIn(emailOrUsername, password);

    if (!user) {
        session.flash('error', 'Invalid username/password.');

        return redirect('/auth/sign-in', {
            headers: {
                'Set-Cookie': await commitSession(session)
            }
        });
    }

    session.set('userId', user.id);

    return redirect('/dashboard', {
        headers: {
            'Set-Cookie': await commitSession(session)
        }
    });
}

export default function SignIn() {
    return <SignInForm />;
}

export function ErrorBoundary() {
    return <ErrorBoundaryLayout />;
}