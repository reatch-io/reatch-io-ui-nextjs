'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/models/customer";
import { ArrowLeft, Plus, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EventAttribute {
    key: string;
    value: string;
}

export default function LogEventPage() {
    const params = useParams();
    const router = useRouter();
    const { projectId, systemId } = params as { projectId: string; systemId: string };

    const [eventName, setEventName] = useState("");
    const [eventTime, setEventTime] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });
    const [attributes, setAttributes] = useState<EventAttribute[]>([
        { key: "", value: "" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customer, setCustomer] = useState<Customer>();

    useEffect(() => {
        api.get(`/api/customers/${systemId}`, {
            headers: {
                "X-Project-ID": projectId,
            },
        }).then((response) => {
            setCustomer(response.data);
        }).catch((error) => {
            console.error(error);
        });
    }, [systemId]);

    const handleAddAttribute = () => {
        setAttributes([...attributes, { key: "", value: "" }]);
    };

    const handleRemoveAttribute = (index: number) => {
        if (attributes.length > 1) {
            setAttributes(attributes.filter((_, i) => i !== index));
        }
    };

    const handleAttributeChange = (index: number, field: 'key' | 'value', value: string) => {
        const newAttributes = [...attributes];
        newAttributes[index][field] = value;
        setAttributes(newAttributes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!eventName.trim()) {
            toast.error("Event name is required");
            return;
        }

        if (!eventTime) {
            toast.error("Event time is required");
            return;
        }

        // Filter out empty attributes and format as array of objects
        const attributesList = attributes
            .filter(attr => attr.key.trim() && attr.value.trim())
            .map(attr => ({
                key: attr.key.trim(),
                value: attr.value.trim()
            }));

        setIsSubmitting(true);

        try {
            await api.post(
                `/api/customers/${customer?.customerId}/events`,
                {
                    name: eventName.trim(),
                    time: new Date(eventTime).toISOString(),
                    attributes: attributesList
                },
                {
                    headers: {
                        "X-Project-ID": projectId
                    }
                }
            );

            toast.success("Event logged successfully");
            router.push(`/${projectId}/customers/${systemId}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to log event");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <Link href={`/${projectId}/customers/${systemId}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Customer
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Log Event</h3>
                <p className="text-muted-foreground mt-2">Record a new event for this customer</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                        <CardDescription>Enter the event information and attributes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Event Name */}
                        <div className="space-y-2">
                            <Label htmlFor="eventName" className="required">Event Name</Label>
                            <Input
                                id="eventName"
                                placeholder="e.g., purchase_completed, page_viewed"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                A descriptive name for the event
                            </p>
                        </div>

                        {/* Event Time */}
                        <div className="space-y-2">
                            <Label htmlFor="eventTime" className="required flex items-center gap-2">
                                <Calendar size={16} />
                                Event Time
                            </Label>
                            <Input
                                id="eventTime"
                                type="datetime-local"
                                value={eventTime}
                                onChange={(e) => setEventTime(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                When this event occurred
                            </p>
                        </div>

                        {/* Attributes */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Event Attributes</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddAttribute}
                                    className="flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Attribute
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {attributes.map((attribute, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Key (e.g., product_id)"
                                                value={attribute.key}
                                                onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Value (e.g., 12345)"
                                                value={attribute.value}
                                                onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveAttribute(index)}
                                            disabled={attributes.length === 1}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Add custom attributes to provide more context about this event
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <Button
                                type="submit"
                                className="bg-gradient-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Logging Event..." : "Log Event"}
                            </Button>
                            <Link href={`/${projectId}/customers/${systemId}`}>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}