import Link from "next/link"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import Image from "next/image";
import {signIn} from "@/auth";
import {AuthError} from "next-auth";
import {LogIn} from "lucide-react";

export function LoginForm() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center"
             style={{backgroundImage: 'url(/bg2.jpg)'}}>

            <Card className="z-20 mx-auto max-w-sm backdrop-blur supports-[backdrop-filter]:bg-background/90">
                <CardHeader>
                    <div className="flex flex-row">
                        <Image
                            src="/favicon.png"
                            alt="Image"
                            width="128"
                            height="128"
                            className="h-12 w-12 dark:brightness-[1.4]"
                        />
                        <h1 className="text-5xl font-bold"><span
                            className="text-sky-800 dark:text-sky-600">FMA</span> Brokers
                        </h1>
                    </div>
                    <CardTitle className="text-2xl">Inicio de sesión</CardTitle>
                    <CardDescription>
                        Completa tus datos para ingresar a tu cuenta:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        action={async (formData) => {
                            "use server";
                            try {
                                await signIn("credentials", {
                                    username: formData.get("username"),
                                    password: formData.get("password"),
                                    redirect: true,
                                    redirectTo: "/dashboard",
                                })
                            } catch (error) {
                                if (error instanceof AuthError)
                                    console.log(error) // Handle auth errors
                                throw error // Rethrow all other errors
                            }
                        }}
                        className="grid gap-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="username">Email</Label>
                            <Input name="username" type="text" placeholder="" required/>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Contraseña</Label>
                                <Link
                                    href="/"
                                    className="ml-auto inline-block text-sm underline"
                                >
                                    Olvidé mi contraseña
                                </Link>
                            </div>
                            <Input
                                name="password"
                                type="password"
                                placeholder=""
                                required
                            />
                        </div>
                        {/*recordarme*/}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember-me"
                                name="remember-me"
                                className="rounded"
                            />
                            <Label htmlFor="remember-me">Recordarme</Label>
                        </div>
                        <Button type="submit" className="w-full">

                            Ingresar
                            <LogIn/>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
