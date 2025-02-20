import SignInForm from "~/components/auth/sign-in-form";
import ErrorBoundaryLayout from "~/components/shared/error-boundary.layout";

export function meta() {
    return [{
        title: 'Sign In',
        description: 'Sign in to your Valkyrie account.',
    }];
}

export default function SignIn() {
    return <SignInForm />;
}

export function ErrorBoundary() {
    return <ErrorBoundaryLayout />;
}