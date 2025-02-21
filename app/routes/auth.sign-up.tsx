import { ActionFunctionArgs, redirect } from '@remix-run/node';
import SignUpForm from '~/components/auth/sign-up-form';
import ErrorBoundaryLayout from "~/components/shared/error-boundary.layout";
import { getUserByEmail, getUserByUsername, signUp } from '~/api/user';

export function meta() {
    return [{
        title: 'Sign Up',
        description: 'Sign up for a new Valkyrie account.',
    }];
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const username = formData.get('username') as string;

    if (await getUserByUsername(username)) {
        return {
            error: true,
            message: 'Username is already taken.',
            path: ['username']
        };
    }

    const email = formData.get('email') as string;

    if (await getUserByEmail(email)) {
        return {
            error: true,
            message: 'Account for this email already exists.',
            path: ['email']
        };
    }

    const password = formData.get('password') as string;
    
    await signUp(email, username, password);

    return redirect('/auth/sign-in');
}

export default function SignUp() {
    return <SignUpForm />;
}

export function ErrorBoundary() {
    return <ErrorBoundaryLayout />;
}