'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, SaveIcon } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from 'countries-list'
import api from "@/api/auth/app-api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const FormSchema = z.object({
    systemId: z.string(),
    customerId: z.string(),
    firstName: z.string().min(1, {
        message: "First name must be at least 1 character.",
    }),
    lastName: z.string().min(1, {
        message: "Last name must be at least 1 character.",
    }),
    email: z.string(),
    phoneNumber: z.string(),
    country: z.string(),
})

export default function AddCustomerPage() {

    const params = useParams();
    const { projectId, systemId } = params as { projectId: string; systemId: string };
    const [ updated, setUpdated ] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            country: "",
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        api.post("http://localhost:9090/api/customers", data, {
            headers: {
                "Content-Type": "application/json",
                "X-Project-ID": projectId,
            },
        })
        .then(() => {
            toast.success("Customer updated successfully!");
            setUpdated(true);
            form.reset();
        })
        .catch((error) => {
            toast.error("Failed to update customer.");
            setUpdated(false);
        })
    }

    useEffect(() => {
        api.get(`http://localhost:9090/api/customers/${systemId}`, {
            headers: {
                "X-Project-ID": projectId,
            },
        })
        .then((response) => {
            form.reset(response.data);
        })
        .catch((error) => {
            toast.error("Failed to fetch customer data.");
        });
    }, [systemId, updated]);

    return (
        <div>
            <div className="mb-6">
                <Link href={`.`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Customer
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Edit Customer</h3>
                    <p className="leading-7">Update customer information</p>
                </div>
            </div>
            <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Customer Information</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <input type="hidden" {...form.register("systemId")} />
                        <input type="hidden" {...form.register("customerId")} />
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
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
                                    <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="(123) 456-7890" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The value must be in <b>E.164</b> format (e.g. <code>+1234567890</code>)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a country" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(countries).map(([, country]) => (
                                                <SelectItem key={country.name} value={country.name}>
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="bg-gradient-primary"><SaveIcon />Save changes</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}