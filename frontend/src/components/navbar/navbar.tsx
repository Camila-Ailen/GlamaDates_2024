import Link from "next/link";
import {
    BarChart,
    BarChart3,
    Box,
    Building2,
    CheckSquare,
    CircleUser,
    FileUp,
    Folder,
    Grid,
    LineChart,
    Menu,
    Network,
    PieChart,
    Users,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ModeToggle} from "@/components/darkmode";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {auth, signOut} from "@/auth";
import Image from "next/image";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { GetServerSideProps } from "next";


export async function Navbar() {
    const session = await auth();
    if (!session?.user) return <></>;
    return (
        <header
            className="z-40 sticky top-0 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            <Image
                src="/favicon.png"
                alt="Image"
                width="128"
                height="128"
                className="h-12 w-12 dark:brightness-[1.4]"
            />
            <strong className="text-xl font-bold"><span className="text-sky-800 dark:text-sky-600">FMA </span>Brokers
            </strong>
            <nav
                className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            </nav>
            <div className="flex items-center space-x-1"><Link href="/dashboard">
                <Button variant="ghost" className="px-2">
                    Dashboard
                </Button>
            </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="px-2">Solicitudes</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem>
                            <CheckSquare className="mr-2 h-4 w-4 text-primary"/>
                            <span>Nueva solicitud</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Folder className="mr-2 h-4 w-4 text-primary"/>
                            <span>Solicitudes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <FileUp className="mr-2 h-4 w-4 text-primary"/>
                            <span>Subir solicitudes</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="px-2">Productos</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem>
                            <Box className="mr-2 h-4 w-4 text-primary"/>
                            <span>Productos</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Network className="mr-2 h-4 w-4 text-primary"/>
                            <span>Ramas</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4 text-primary"/>
                            <span>Productos de socio</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Grid className="mr-2 h-4 w-4 text-primary"/>
                            <span>Variantes</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="px-2">Reportes</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4 text-primary"/>
                            <span>Reportes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <LineChart className="mr-2 h-4 w-4 text-primary"/>
                            <span>Reporte de ventas</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <BarChart className="mr-2 h-4 w-4 text-primary"/>
                            <span>Reporte de análisis</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <PieChart className="mr-2 h-4 w-4 text-primary"/>
                            <span>Reporte de estados</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="px-2">Administración</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4 text-primary"/>
                            <span>Usuarios</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Building2 className="mr-2 h-4 w-4 text-primary"/>
                            <span>Sucursales</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5"/>
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="#"
                            className="flex items-center gap-2 text-lg font-semibold"
                        >
                            <Image
                                src="/favicon.png"
                                alt="Image"
                                width="128"
                                height="128"
                                className="h-12 w-12 dark:brightness-[1.4]"
                            /> <span className="sr-only">FMA Brokers</span>
                        </Link>

                    </nav>
                </SheetContent>
            </Sheet>


            <div className="ml-auto flex items-center space-x-4">
                <ModeToggle/>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <CircleUser className="h-6 w-6" strokeWidth="1"/>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <form
                            action={async () => {
                                "use server";
                                await signOut();
                            }}
                        >
                            <button type="submit">Sign Out</button>
                        </form>
                        <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
