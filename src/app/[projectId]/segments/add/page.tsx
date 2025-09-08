'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SegmentGroups } from "@/components/ui/segment-groups";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import { useState, useRef } from "react";

const FormSchema = z.object({
    name: z.string().min(1, {
        message: "Name must be at least 1 character.",
    }),
    description: z.string().min(1, {
        message: "Description must be at least 1 character.",
    }),
})

export default function AddSegmentPage() {
    const params = useParams();
    const { projectId } = params as { projectId: string };

    const [_, setGroups] = useState([{ filters: [] }]);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    })

    // Create a ref to hold the groups state from SegmentGroups
    const segmentGroupsRef = useRef<{ getGroups: () => any[] }>(null);

    function onSubmit(data: z.infer<typeof FormSchema>) {
        // Get the groups from the SegmentGroups component
        const groups = segmentGroupsRef.current?.getGroups() || [];
        
        // call api
        api.post(`/api/segments`, {
            ...data,
            groups
        }, {
            headers: {
                "Content-Type": "application/json",
                "X-Project-ID": projectId,
            }
        })
            .then(() => {
                toast.success("Segment created successfully");
                form.reset();
                setGroups([{ filters: [] }]);
            })
            .catch((error) => {
                toast.error("Failed to create segment");
                console.error("Error creating segment:", error);
            });
    }


    return (
        <div>
            <div className="mb-6">
                <Link href={`.`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Segments
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Add New Segment</h3>
                    <p className="leading-7">Create a new segment</p>
                </div>
            </div>
            <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Segment Information</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="High value customers" {...field} />
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
                                        <Input placeholder="Describe the segment" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Groups Card */}
                        <SegmentGroups ref={segmentGroupsRef} />
                        <Button type="submit" className="bg-gradient-primary">Submit</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}