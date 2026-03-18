import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { z } from 'zod';
import { getSession, commitSession } from "~/session.server";
import { signUp } from '~/api/user';
import SignUpForm from '~/components/auth/sign-up-form';
import ErrorBoundaryLayout from "~/components/shared/error-boundary.layout";

const signUpSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters long.')
        .max(64, 'Username must be at most 64 characters long.'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long.')
        .max(64, 'Password must be at most 64 characters long.'),
});

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

    const result = signUpSchema.safeParse({
        email: formData.get('email'),
        username: formData.get('username'),
        password: formData.get('password'),
    });

    if (!result.success) {
        const firstError = result.error.errors[0]?.message ?? 'Invalid input.';
        session.flash('error', firstError);

        return redirect('/auth/sign-up', {
            headers: {
                'Set-Cookie': await commitSession(session)
            }
        });
    }

    const { email, username, password } = result.data;

    try {
        await signUp(email, username, password);
    } catch {
        session.flash('error', 'An account with that information already exists.');

        return redirect('/auth/sign-up', {
            headers: {
                'Set-Cookie': await commitSession(session)
            }
        });
    }

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
