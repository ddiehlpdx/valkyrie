import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { getSession, commitSession } from "~/session.server";
import { getUserByEmail, getUserByUsername, signUp } from '~/api/user';
import SignUpForm from '~/components/auth/sign-up-form';
import ErrorBoundaryLayout from "~/components/shared/error-boundary.layout";

export function meta() {
    return [{
        title: 'Sign Up',
        description: 'Sign up for a new Valkyrie account.',
    }];
}

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
  
    if (session.has('userId')) {
      return redirect('/dashboard');
    }

    const error = session.get('error');

    return Response.json(
        { error },
        {
            headers: {
                'Set-Cookie': await commitSession(session)
            }
        }
    );
}


export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const formData = await request.formData();
    const username = formData.get('username') as string;

    if (await getUserByUsername(username)) {
        session.flash('error', 'Username is already taken.');

        return redirect('/auth/sign-up', {
            headers: {
                'Set-Cookie': await commitSession(session)
            }
        });
    }

    const email = formData.get('email') as string;

    if (await getUserByEmail(email)) {
        session.flash('error', 'Account for this email address already exists.');

        return redirect('/auth/sign-up', {
            headers: {
                'Set-Cookie': await commitSession(session)
            }
        });
    }

    const password = formData.get('password') as string;
    
    await signUp(email, username, password);

    return redirect('/auth/sign-in', {
        headers: {
            'Set-Cookie': await commitSession(session)
        }
    });
}

export default function SignUp() {
    return <SignUpForm />;
}

export function ErrorBoundary() {
    return <ErrorBoundaryLayout />;
}