import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// interface User
interface User {
    id: number
    firstName: string
    lastName: string
    email: string
    branchOfficeId: number | null
    role: {
      id: number
      role: string
      description: string
      permissions: Array<{
        id: number
        permission: string
        description: string | null
      }>
    }
  }


export const {handlers, signIn, signOut, auth} = NextAuth({
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                username: {},
                password: {},
            },
            authorize: async (credentials) => {
                let user = null;
                console.log("process.env.BACKEND_URL: ",process.env.NEXT_PUBLIC_BACKEND_URL);
                let res;
                try {
                    res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(credentials),
                    });
                } catch (error) {
                    console.error("Error during fetch: ", error);
                    throw new Error("Failed to fetch");
                }

                const response = await res.json();
                if (res.status !== 201) {
                    console.error("Authentication failed. Please check your credentials and try again.");
                    throw new Error("Authentication failed");
                }
                console.log("response from auth: ",response);
                user = response.user;
                if (!user) {
                    throw new Error("User not found.")
                }
                user.token = response.access_token;
                user.roles = response.user.roles;
                user.name = response.user.firstName;
                user.lastName = response.user.lastName;
                console.log("user: ",user);


                user.image = `http://172.19.0.4:3002/files/${user.profileImage}`;
                // return user object with the their profile data
                return user
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        jwt({ token, user }) {
          if (user) { // User is available during sign-in
            token.id = user.id
          }
          return token
        },
        session({ session, token }) {
          session.user.id = token.id as string;
          return session
        },
      },
})
