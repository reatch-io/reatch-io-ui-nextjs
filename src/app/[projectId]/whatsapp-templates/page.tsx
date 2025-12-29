"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhatsAppTemplatesTableClient } from "./whatsapp-templates-list";
import { PlusIcon } from "lucide-react";


export default function WhatsAppTemplatesPage() {
    const { projectId } = useParams() as { projectId: string };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">WhatsApp Templates</h3>
                    <p className="leading-7">Create and manage your WhatsApp message templates.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/${projectId}/whatsapp-templates/add`} passHref>
                        <Button className="bg-gradient-primary">
                            <PlusIcon /> Create Template
                        </Button>
                    </Link>
                </div>
            </div>

            <div>
                <WhatsAppTemplatesTableClient />
            </div>
        </div>
    );
}