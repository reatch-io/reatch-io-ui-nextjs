"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/api/auth/app-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Domain } from "@/models/domain";

export default function DomainsPage() {
    const { projectId } = useParams() as { projectId: string };
    const [domain, setDomain] = useState<Domain | null>(null);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newDomain, setNewDomain] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [deleting, setDeleting] = useState(false); // added state

    const load = () => {
        setLoading(true);
        api.get("/api/email/domains", { headers: { "X-Project-ID": projectId } })
            .then(res => setDomain(res.data || null))
            .catch(() => {
                setDomain(null);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!projectId) return;
        load();
    }, [projectId]);

    const handleCreate = () => {
        if (!newDomain.trim()) {
            toast.error("Please enter a domain.");
            return;
        }
        setCreating(true);
        api.post(
            "/api/email/domains",
            { domain: newDomain.trim() },
            { headers: { "X-Project-ID": projectId } }
        )
            .then(() => {
                toast.success("Domain created.");
                setNewDomain("");
                load();
            })
            .catch(() => {
                toast.error("Failed to create domain.");
            })
            .finally(() => setCreating(false));
    };

    const handleVerify = () => {
        if (!projectId) return;
        setVerifying(true);
        api.post(
            "/api/email/domains/verify",
            {},
            { headers: { "X-Project-ID": projectId } }
        )
            .then((res) => {
                const data = res.data || {};
                setDomain(prev => {
                    if (!prev) return prev;
                    const dns = { ...(prev.dns || {}) };
                    const results: Record<string, { valid: boolean; reason?: string }> = data.validationResults || {};
                    Object.entries(results).forEach(([key, status]) => {
                        const existing = dns[key] || { type: "", host: "", data: "", valid: false };
                        dns[key] = { ...existing, valid: !!status.valid, validationReason: status.reason || "" } as any;
                    });
                    return { ...prev, valid: !!data.valid, dns };
                });
                toast.success("Verification requested.");
                load();
            })
            .catch(() => {
                toast.error("Failed to request verification.");
            })
            .finally(() => setVerifying(false));
    };

    // new delete handler
    const handleDelete = () => {
        if (!projectId || !domain) return;
        const ok = window.confirm(`Delete domain "${domain.domain}"? This cannot be undone.`);
        if (!ok) return;
        setDeleting(true);
        api.delete("/api/email/domains", { headers: { "X-Project-ID": projectId } })
            .then(() => {
                toast.success("Domain deleted.");
                setDomain(null);
                load();
            })
            .catch(() => {
                toast.error("Failed to delete domain.");
            })
            .finally(() => setDeleting(false));
    };

    return (
        <div className="p-6">
            {/* Header / description — full width */}
            <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Domains</h3>
                <p className="leading-7 text-muted-foreground">
                    Configure sending domains for this project. Domains are used for verified email sending.
                </p>
            </div>

            {/* Content stacked below header */}
            <div className="mt-6">
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : domain ? (
                    <div className="flex flex-col gap-6">
                        <div key={domain.id} className="p-4 flex items-center justify-between border rounded">
                            <div>
                                <div className="font-semibold">{domain.domain}</div>
                                <div className="text-xs text-muted-foreground">
                                    {domain.valid ? "Verified" : "Not verified"}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button onClick={handleVerify} disabled={verifying} size="sm" variant="outline">
                                    {verifying ? "Verifying..." : "Verify"}
                                </Button>
                                <Button onClick={handleDelete} disabled={deleting} size="sm" variant="outline" className="text-red-600 border-red-200">
                                    {deleting ? "Deleting..." : "Delete"}
                                </Button>
                            </div>
                        </div>

                        {/* Instruction: add DNS records to your domain and verify */}
                        <div className="text-sm text-muted-foreground mb-4">
                            These DNS records need to be added to your domain's DNS provider. After adding them, click <strong>Verify</strong> above to re-check.
                        </div>

                        {/* DNS records as a table */}
                        <div className="p-4 border rounded">
                            <div className="font-semibold mb-2">DNS Records</div>
                            {domain.dns && Object.keys(domain.dns).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 table-auto">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {Object.entries(domain.dns).map(([key, rec]) => (
                                                <tr key={key}>
                                                    <td className="px-4 py-3 align-top text-sm text-muted-foreground">{key}</td>
                                                    <td className="px-4 py-3 align-top text-sm">{rec.type}</td>
                                                    <td className="px-4 py-3 align-top text-sm text-muted-foreground">{rec.host}</td>
                                                    <td className="px-4 py-3 align-top text-sm">
                                                        <pre className="whitespace-pre-wrap break-words font-mono text-xs text-gray-700 m-0">{rec.data}</pre>
                                                    </td>
                                                    <td className="px-4 py-3 align-top text-sm">
                                                        <span className={rec.valid ? "text-green-600" : "text-red-600"}>
                                                            {rec.valid ? "Valid" : "Not valid"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">No DNS records available for this domain.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-6 border rounded">
                        <div className="text-sm text-muted-foreground mb-4">
                            Add a sending domain for this project to start sending verified emails.
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newDomain}
                                onChange={e => setNewDomain(e.target.value)}
                                placeholder="example.com"
                            />
                            <Button onClick={handleCreate} disabled={creating}>
                                {creating ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}