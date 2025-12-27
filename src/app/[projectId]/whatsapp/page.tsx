"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Account, Sender } from "@/models/whatsapp";
import { SenderTableClient } from "./senders-list";


export default function WhatsAppSendersPage() {
    const { projectId } = useParams() as { projectId: string };

    const [loadingAccount, setLoadingAccount] = useState(true);
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [account, setAccount] = useState<Account | null>(null);

    const [loadingSenders, setLoadingSenders] = useState(false);
    const [senders, setSenders] = useState<Sender[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // fetch account helper so we can re-use after create
    const fetchAccount = async () => {
        if (!projectId) return;
        setLoadingAccount(true);
        try {
            const res = await api.get("/api/whatsapp", { headers: { "X-Project-ID": projectId } });
            setAccount(res.data ?? null);
        } catch (err) {
            setAccount(null);
        } finally {
            setLoadingAccount(false);
        }
    };

    // load account on mount
    useEffect(() => {
        fetchAccount();
    }, [projectId]);

    // load senders when account exists
    useEffect(() => {
        if (!projectId) return;
        if (!account) {
            setSenders([]);
            return;
        }
        setLoadingSenders(true);
        api.get("/api/whatsapp/senders", { headers: { "X-Project-ID": projectId } })
            .then((res) => {
                setSenders(res.data.content || []);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to load WhatsApp senders.");
            })
            .finally(() => setLoadingSenders(false));
    }, [projectId, account]);

    const createAccount = async () => {
        if (!projectId) return;
        setCreatingAccount(true);
        try {
            await api.post("/api/whatsapp", {}, { headers: { "X-Project-ID": projectId } });
            // refresh account state (will trigger senders load via effect)
            await fetchAccount();
            toast.success("WhatsApp account created.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create WhatsApp account.");
        } finally {
            setCreatingAccount(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this sender? This action cannot be undone.")) return;
        setDeletingId(id);
        try {
            await api.delete(`/api/whatsapp/senders/${id}`, { headers: { "X-Project-ID": projectId } });
            setSenders((s) => s.filter((x) => x.id !== id));
            toast.success("Sender deleted.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete sender.");
        } finally {
            setDeletingId(null);
        }
    };

    // Loading state
    if (loadingAccount) {
        return (
            <div className="p-6">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    // No account: show explanation + Get started
    if (!account) {
        return (
            <div className="p-6 max-w-3xl">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">WhatsApp for your project</h3>
                <p className="leading-7 text-muted-foreground mt-2">
                    To send messages via WhatsApp you first need to create a WhatsApp account (WABA) for this project.
                    Once created you'll be able to register senders that will deliver messages to your users.
                </p>

                <div className="mt-6 border rounded p-5">
                    <p className="text-sm text-muted-foreground mb-4">
                        Click "Get started" to create a WhatsApp account for this project. This will create the required
                        configuration and allow you to register senders.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={createAccount} disabled={creatingAccount} className="bg-gradient-primary">
                            {creatingAccount ? "Creating..." : "Get started"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Account exists: show account info + senders
    return (
        <div className="p-6">
            {/* Header / account info */}
            <div className="mb-4">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">WhatsApp Account</h3>
                <p className="leading-7 text-muted-foreground">
                    Account ID: <span className="font-medium">{account.id}</span>
                    {account.createdAt && (
                        <span className="ml-3 text-sm text-muted-foreground">Created: {new Date(account.createdAt).toLocaleString()}</span>
                    )}
                </p>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Manage WhatsApp senders for this project.</p>
                <Link href={`/${projectId}/whatsapp/register`}>
                    <Button className="bg-gradient-primary">Register sender</Button>
                </Link>
            </div>

            <div>
                {loadingSenders ? (
                    <div className="space-y-3 max-w-3xl">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <SenderTableClient/>
                )}
            </div>
        </div>
    );
}