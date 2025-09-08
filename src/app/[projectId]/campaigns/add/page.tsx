'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import { Mail, MessageCircle, Bell, Calendar, Zap, Code2 } from "lucide-react";

const FormSchema = z.object({
    name: z.string().min(1, {
        message: "Name must be at least 1 character.",
    }),
    description: z.string().min(1, {
        message: "Description must be at least 1 character.",
    }),
})

export default function AddCampaignPage() {
    const params = useParams();
    const { projectId } = params as { projectId: string };
    const router = useRouter();
    

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        api.post(`/api/campaigns`, {
            ...data
        }, {
            headers: {
                "Content-Type": "application/json",
                "X-Project-ID": projectId,
            }
        })
            .then((res) => {
                toast.success("Campaign created successfully");
                form.reset();
                // Redirect to the campaign edit page using the returned campaign ID
                const campaignId = res.data?.id;
                if (campaignId) {
                    router.push(`${campaignId}`);
                }
            })
            .catch((error) => {
                toast.error("Failed to create campaign");
                console.error("Error creating campaign:", error);
            });
    }


    return (
        <div>
            <div className="mb-6">
                <Link href={`.`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Campaigns
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Add New Campaign</h3>
                    <p className="leading-7">Create a new campaign</p>
                </div>
            </div>
            <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Campaign Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    When you submit this form, the campaign will be created in <span className="font-semibold">draft</span> status. You can further customize and launch it after creation.
                </p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter campaign name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Describe the campaign" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="bg-gradient-primary">Create and Configure</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}