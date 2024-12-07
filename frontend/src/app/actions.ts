'use server'

import { signIn } from "@/auth"

export async function login(username: string, password: string) {
        try {
            await signIn("credentials", {
                username,
                password,
                redirect: true,
                redirectTo: "/dashboard"
            })
        } catch (error) {
            console.error("Error al iniciar sesión")
}
}
