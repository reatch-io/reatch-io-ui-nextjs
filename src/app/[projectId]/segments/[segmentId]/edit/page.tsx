'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SegmentGroups } from "@/components/ui/segment-groups";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod"
import { useState, useRef, useEffect } from "react";
import { Segment } from "@/models/segment";

const FormSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {
        message: "Name must be at least 1 character.",
    }),
    description: z.string().min(1, {
        message: "Description must be at least 1 character.",
    }),
})

export default function EditSegmentPage() {
    const params = useParams();
    const router = useRouter();
    const { projectId, segmentId } = params as { projectId: string, segmentId: string };

    const [loading, setLoading] = useState(true);
    const [segment, setSegment] = useState<Segment>();

    // Create a ref to hold the groups state from SegmentGroups
    const segmentGroupsRef = useRef<{ getGroups: () => any[] }>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        setLoading(true);
        api.get(`/api/segments/${segmentId}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Project-ID": projectId,
            }
        })
            .then((res) => {
                setSegment(res.data);
                form.reset(res.data);
            })
            .catch(() => {
                toast.error("Failed to load segment data");
            })
            .finally(() => setLoading(false));
    }, [segmentId, projectId]);

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const groups = segmentGroupsRef.current?.getGroups() || [];
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
                toast.success("Segment updated successfully");
                router.push(`/${projectId}/segments/${segmentId}`);
            })
            .catch((error) => {
                toast.error("Failed to update segment");
                console.error("Error updating segment:", error);
            });
    }

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <Link href={`../${segmentId}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Segment
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Edit Segment</h3>
                    <p className="leading-7">Update segment details and filters</p>
                </div>
            </div>
            <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Segment Information</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <input type="hidden" {...form.register("id")} />
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
                        <SegmentGroups
                            ref={segmentGroupsRef}
                            initialGroups={segment?.groups}
                        />
                        <Button type="submit" className="bg-gradient-primary">Save Changes</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}