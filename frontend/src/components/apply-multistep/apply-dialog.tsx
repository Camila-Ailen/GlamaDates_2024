"use client";

import * as React from "react";
import {
  BikeIcon as Motorcycle,
  Car,
  Cross,
  Heart,
  HeartPulse,
  Home,
  ShieldCheck,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { create } from "zustand";

type Store = {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const useStore = create<Store>()((set) => ({
  isOpen: false,
  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
}));

export { useStore };

const formSchema = z.object({
  // Client Search
  documentType: z.string(),
  documentNumber: z.string(),
  gender: z.string(),

  // Personal Information
  name: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  birthDate: z.string(),
  occupation: z.string(),
  civilStatus: z.string(),

  // Contact Information
  country: z.string(),
  province: z.string(),
  city: z.string(),
  postalCode: z.string(),
  address: z.string(),
  number: z.string(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  email: z.string().email("Email inválido"),
  areaCode: z.string(),
  phone: z.string(),

  // Bank Information
  cbu: z.string(),
  accountNumber: z.string(),
});

export default function InsuranceForm() {
  const [setOpen] = React.useState(true);
  const [step, setStep] = React.useState(1);
  const [insuranceType, setInsuranceType] = React.useState<string | null>(null);
  const { isOpen, closeDialog } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: "DNI",
      country: "Argentina",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log(values);
    }
  };

  const insuranceCards = {
    patrimonial: [
      { icon: ShieldCheck, title: "Robo", description: "Robo" },
      { icon: Home, title: "Hogar", description: "Hogar" },
      { icon: Car, title: "Auto", description: "Seguro de auto" },
      { icon: Motorcycle, title: "Moto", description: "Seguro de moto" },
    ],
    noPatrimonial: [
      { icon: Heart, title: "Vida", description: "Seguro de vida" },
      { icon: HeartPulse, title: "Salud", description: "Salud" },
      {
        icon: User,
        title: "Accidentes personales",
        description: "Accidentes Personales",
      },
      { icon: Cross, title: "Sepelio", description: "Sepelio" },
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nueva solicitud</DialogTitle>
        </DialogHeader>
        {!insuranceType ? (
          <Tabs defaultValue="patrimonial" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patrimonial">Patrimonial</TabsTrigger>
              <TabsTrigger value="noPatrimonial">No patrimonial</TabsTrigger>
            </TabsList>
            <TabsContent value="patrimonial">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insuranceCards.patrimonial.map((card) => (
                  <Card
                    key={card.title}
                    className="cursor-pointer hover:bg-accent border-primary/50"
                    onClick={() => setInsuranceType(card.title)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        {card.title}
                      </CardTitle>
                      <card.icon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{card.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="noPatrimonial">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insuranceCards.noPatrimonial.map((card) => (
                  <Card
                    key={card.title}
                    className="cursor-pointer hover:bg-accent border-primary/50"
                    onClick={() => setInsuranceType(card.title)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        {card.title}
                      </CardTitle>
                      <card.icon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{card.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between border-b pb-4">
              <Button
                variant="ghost"
                onClick={() =>
                  step > 1 ? setStep(step - 1) : setInsuranceType(null)
                }
              >
                Atrás
              </Button>
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`}
                />
                <div
                  className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`}
                />
                <div
                  className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`}
                />
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Busca el cliente</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="documentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de documento</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="DNI">DNI</SelectItem>
                                  <SelectItem value="PASAPORTE">
                                    Pasaporte
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="documentNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de documento</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ingresa el número de documento"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="mt-8">
                          Buscar
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        Información personal
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ingresa el nombre"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellido</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ingresa el apellido"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Información de contacto
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingresa el email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingresa el teléfono"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Información bancaria
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="cbu"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CBU</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingresa el CBU" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de cuenta</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingresa el número de cuenta"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit">
                    {step === 3 ? "Finalizar" : "Siguiente"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
