import { Link, useLoaderData } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Card,
    CardHeader,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle
} from "../ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../ui/form";
import logo from "../../assets/valkyrie_logo_transparent.png";
import type { SessionFlashData } from "~/session.server";

const formSchema = z.object({
    emailOrUsername: z.string(),
    password: z.string()
});

export default function SignInForm() {
    const { error } = useLoaderData<SessionFlashData>();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            emailOrUsername: '',
            password: ''
        }
    });

    return (
        <Card>
            <img src={logo} alt="Valkyrie Logo" className="w-48 h-48 mx-auto mt-4" />
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Sign in to an existing Valkyrie account.</CardDescription>
                <p className="text-[0.8rem] font-medium text-destructive">{ error ? error : '' }</p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form method="post" className="space-y-3">
                        <FormField
                            control={form.control}
                            name="emailOrUsername"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Username or Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="mt-4 w-full">Submit</Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter>
                <p>Don&apos;t have an account yet? <Link to="/auth/sign-up" className="underline">Sign up</Link></p>
            </CardFooter>
        </Card>
    )
}