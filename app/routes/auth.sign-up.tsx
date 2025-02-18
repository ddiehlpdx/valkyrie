import { Link } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardHeader,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle
} from "~/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "~/components/ui/form";
import logo from '../assets/valkyrie_logo_transparent.png';

const formSchema = z.object({
    email: z.string().
        email({ message: 'Please enter a valid email address.' }),
    username: z.string()
        .min(3, { message: 'Username must be at least 3 characters long.' })
        .max(64, { message: 'Username must be at most 64 characters long.' }),
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters long.' })
        .max(64, { message: 'Password must be at most 64 characters long.' }),
    passwordConfirm: z.string()
        .min(8)
        .max(64)
    })
    .refine(data => data.password === data.passwordConfirm, {
        message: 'Passwords do not match.',
        path: ['passwordConfirm']
    });

export default function SignUp() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
            passwordConfirm: ''
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    return (
        <Card>
            <img src={logo} alt="Valkyrie Logo" className="w-48 h-48 mx-auto mt-4" />
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Sign up for a new Valkyrie account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        We&apos;ll never share your email with anyone else.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Username
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Your public username; between 3 and 64 characters.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Between 8 and 64 characters.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="passwordConfirm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Confirm Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Please re-enter your password.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter>
                <p>Already have an account? <Link to="/auth/sign-in" className="underline">Sign in</Link></p>
            </CardFooter>
        </Card>
    );
}