"use client";
import Link from "next/link";
import {
  BarChart,
  BarChart3,
  Box,
  Building2,
  CheckSquare,
  CircleUser,
  ShieldUser,
  FileUp,
  Folder,
  Grid,
  LineChart,
  Menu,
  Network,
  PieChart,
  ShieldAlert,
  Users,
  Armchair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/darkmode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import useAuthStore from "@/app/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!user) return <></>;

  return (
    <AnimatePresence>
      {user && (
        <motion.header
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 1 }}
          className="z-40 sticky top-0 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6"
        >
          <Image
            src="/logo.webp"
            alt="Image"
            width="128"
            height="128"
            className="h-12 w-12 dark:brightness-[1.4]"
          />
          <strong className="text-xl font-bold">
            {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "see:dashboard") ? (
              <Link href="/dashboard">
                <span className="text-primary cursor-pointer">GLAMA </span>DATES
              </Link>
            ) : (
              <>
                <span className="text-primary">GLAMA </span>DATES
              </>
            )}
          </strong>
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"></nav>
          <div className="flex items-center space-x-1">
            {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "see:catalog") && (
              <Link href="/catalog">
                <Button variant="ghost" className="px-2">
                  Catalogo
                </Button>
              </Link>
            )}
            {/* isAutentoicated green dot or red if not */}
            {isAuthenticated ? (
              <span className="h-2 w-2 rounded-full bg-white-500 dark:bg-black-500"></span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
            )}
            {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "see:appointments") && (
              <Link href="/appointment">
                <Button variant="ghost" className="px-2">
                  Turnos
                </Button>
              </Link>
            )}
            {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:todayappointment") && (
              <Link href="/appointmentToday">
                <Button variant="ghost" className="px-2">
                  Turnos HOY
                </Button>
              </Link>
            )}
            {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:mydate") && (
              <Link href="/myDate">
                <Button variant="ghost" className="px-2">
                  Mis Citas
                </Button>
              </Link>
            )}
            {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:mycalendar") && (
              <Link href="/myCalendar">
                <Button variant="ghost" className="px-2">
                  Mi Agenda
                </Button>
              </Link>
            )}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2">
                  Turnos
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                  <CheckSquare className="mr-2 h-4 w-4 text-primary" />
                  <span>Nueva solicitud</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Folder className="mr-2 h-4 w-4 text-primary" />
                  <span>Solicitudes</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileUp className="mr-2 h-4 w-4 text-primary" />
                  <span>Subir solicitudes</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "see:parameters") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2">
                    Parametros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:categories") && (
                    <DropdownMenuItem>
                      <Link href="/category" className="flex items-center">
                        <Network className="mr-2 h-4 w-4 text-primary" />
                        <span>Categorias</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:services") && (
                    <DropdownMenuItem>
                      <Link href="/service" className="flex items-center">
                        <Box className="mr-2 h-4 w-4 text-primary" />
                        <span>Servicios</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:packages") && (
                    <DropdownMenuItem>
                      <Link href="/package" className="flex items-center">
                        <Grid className="mr-2 h-4 w-4 text-primary" />
                        <span>Paquetes</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:workstation") && (
                    <DropdownMenuItem>
                      <Link href="/workstation" className="flex items-center">
                        <Armchair className="mr-2 h-4 w-4 text-primary" />
                        <span>Estaciones de Trabajo</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:roles") && (
                    <DropdownMenuItem>
                      <Link href="/roles" className="flex items-center">
                        <ShieldUser className="mr-2 h-4 w-4 text-primary" />
                        <span>Roles</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:reports") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2">
                    Reportes
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem>
                    <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                    <span>Reportes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LineChart className="mr-2 h-4 w-4 text-primary" />
                    <span>Reporte de ventas</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BarChart className="mr-2 h-4 w-4 text-primary" />
                    <span>Reporte de análisis</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <PieChart className="mr-2 h-4 w-4 text-primary" />
                    <span>Reporte de estados</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-2">
                  Administración
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                  <Link href="/users" className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    <span>Usuarios</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="mr-2 h-4 w-4 text-primary" />
                  <span>Sucursales</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
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
                  />{" "}
                  <span className="sr-only">GLAMADATES</span>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center space-x-4">
            <div className="mr-2 text-primary font-semibold">
              <p>Hola, {user.firstName} {user.lastName}</p>
            </div>

            <ModeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <CircleUser className="h-6 w-6" strokeWidth="1" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                {/* user data */}
                <DropdownMenuItem>
                  <span>{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:mydate") && (
                  <Link href="/myDate">
                    <DropdownMenuItem>Mis citas</DropdownMenuItem>
                  </Link>
                )}
                {isAuthenticated && user?.role.permissions.some(permission => permission.permission === "read:mycalendar") && (
                  <Link href="/myCalendar">
                    <DropdownMenuItem>Mi Agenda</DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
