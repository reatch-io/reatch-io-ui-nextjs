import { CustomerSegment } from "@/components/ui/customer-segment";
import { CustomerStatus } from "@/components/ui/customer-status";
import { Customer } from "@/models/customer";
import { Globe, Mail, Phone } from "lucide-react";

type CustomerInformationProps = {
    customer: Customer | undefined;
};

export default function CustomerInformation({ customer }: CustomerInformationProps) {
    if (!customer) {
        return <div className="text-muted-foreground">No customer data available.</div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Left: Customer information card (70%) */}
                <div className="border rounded-lg p-6 bg-white shadow-sm flex-1 basis-[70%]">
                    <div className="font-semibold text-lg mb-4">Customer information</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">First Name</div>
                            <div>{customer.firstName}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Last Name</div>
                            <div>{customer.lastName}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Mail size={14} className="inline-block" />
                                Email
                            </div>
                            <div>{customer.email || <span className="text-muted-foreground">-</span>}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Phone size={14} className="inline-block" />
                                Phone Number
                            </div>
                            <div>{customer.phoneNumber || <span className="text-muted-foreground">-</span>}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Globe size={14} className="inline-block" />
                                Country
                            </div>
                            <div>{customer.country || <span className="text-muted-foreground">-</span>}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Created At</div>
                            <div>{new Date(customer.createdAt).toLocaleString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}</div>
                        </div>
                    </div>
                </div>

                {/* Right: Two stacked cards (each 30% width) */}
                <div className="flex flex-col gap-4 flex-1 basis-[30%]">
                    {/* Status & Segment Card */}
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <div className="font-semibold text-lg mb-4">Status &amp; Segment</div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Status</div>
                            <CustomerStatus status={customer.status} />
                        </div>
                        <div className="mt-4">
                            <div className="text-xs text-muted-foreground mb-1">Segment</div>
                            <CustomerSegment segment={customer.segment} />
                        </div>
                    </div>
                    {/* Activity Card */}
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <div className="font-semibold text-lg mb-4">Activity</div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Last Activity</div>
                            <div>
                                {customer.lastActivity
                                    ? new Date(customer.lastActivity).toLocaleString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })
                                    : <span className="text-muted-foreground">-</span>
                                }
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                            <div className="color-gradient-primary" style={{ fontSize: "1.5rem" }}>
                                {customer.totalSpent || <span className="text-muted-foreground">-</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Attributes Card */}
            <div className="border rounded-lg p-6 bg-white shadow-sm mt-6">
                <div className="font-semibold text-lg mb-4">Customer Attributes</div>
                {customer.attributes && customer.attributes.length > 0 ? (
                    <div className="divide-y">
                        {customer.attributes.map((attr) => (
                            <div key={attr.key} className="flex justify-between py-2">
                                <div className="text-s text-muted-foreground">{attr.key}</div>
                                <div>{JSON.parse(attr.value)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted-foreground">No attributes</div>
                )}
            </div>

            <div className="border rounded-lg p-6 bg-white shadow-sm mt-6 mb-6">
                <div className="font-semibold text-lg mb-4">Customer Events</div>
                {customer.events && customer.events.length > 0 ? (
                    <div className="space-y-6">
                        {customer.events.map((event, idx) => (
                            <div
                                key={idx}
                                className="border rounded-lg p-4 bg-white shadow-sm pb-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold">{event.name}</span>
                                    <span className="text-xs text-muted-foreground">{event.time
                                        ? new Date(event.time).toLocaleString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })
                                        : "-"}</span>
                                </div>
                                <div className="space-y-1 pl-4 border-l-4 border-muted-foreground/20">
                                    {event.attributes.map(attr => (
                                        <div key={attr.key} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{attr.key}</span>
                                            <span>{JSON.parse(attr.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted-foreground">No events</div>
                )}
            </div>
        </div>
    );
}