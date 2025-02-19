import SignUpForm from '~/components/auth/sign-up-form';
import ErrorBoundaryLayout from "~/components/shared/error-boundary-layout";

export function meta() {
    return [{
        title: 'Sign Up',
        description: 'Sign up for a new Valkyrie account.',
    }];
}

export default function SignUp() {
    return <SignUpForm />;
}

export function ErrorBoundary() {
    return <ErrorBoundaryLayout />;
}