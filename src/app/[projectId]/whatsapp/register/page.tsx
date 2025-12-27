"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/api/auth/app-api";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterSenderPage() {
    const { projectId } = useParams() as { projectId: string };
    const [phone, setPhone] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [wabaId, setWabaId] = useState<string>("");
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;

        script.onload = () => {
            if ((window as any).FB) {
                (window as any).FB.init({
                    appId: "1262471968390234",
                    autoLogAppEvents: true,
                    xfbml: true,
                    version: "v24.0",
                });
            }
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (!event.origin.includes("facebook.com")) return;
            let payload: any;
            try {
                payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
            } catch {
                payload = event.data;
            }

            if (!payload || payload.type !== "WA_EMBEDDED_SIGNUP") return;

            const waEvent = (payload.event || "").toString().toUpperCase();
            if (waEvent === "FINISH" || waEvent === "FINISH_ONLY_WABA") {
                const dataMap = payload.data || {};
                const wabaId = dataMap?.waba_id || dataMap?.wabaId || dataMap?.waba;
                if (wabaId) setWabaId(String(wabaId));
                toast.success("WhatsApp setup finished.");
            } else if (waEvent === "CANCEL") {
                toast.warning("Login to Facebook is cancelled");
            } else if (waEvent === "ERROR") {
                const msg = payload.data ? JSON.stringify(payload.data) : "Unknown error";
                toast.error("Error while login to Facebook: " + msg);
            }
        };

        window.addEventListener("message", onMessage);
        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, []);

    // normalize simple E.164-ish format
    const asE164 = useCallback((raw: string) => {
        if (!raw) return "";
        let s = raw.replace(/[^\d+]/g, "");
        if (!s.startsWith("+")) s = "+" + s.replace(/^0+/, "");
        return s;
    }, []);

    const launchWhatsAppSignup = () => {
        if (!(window as any).FB) {
            toast.error("Facebook SDK not loaded yet.");
            return;
        }

        (window as any).FB.login(() => { }, {
            config_id: "1383943509638407",
            auth_type: "rerequest",
            response_type: "code",
            override_default_response_type: true,
            extras: {
                sessionInfoVersion: 3,
                setup: {
                    solutionID: "1594924791160351",
                },
            },
        });
    };

    // manual register handler (uses same createSender logic)
    const handleRegisterClick = async () => {
        if (!wabaId) {
            toast.error("WABA ID is required to register. Use 'Continue with Facebook' or paste WABA ID here.");
            return;
        }
        setRegistering(true);
        try {
            if (!wabaId) {
                toast.error("Missing WABA id from Facebook response.");
                return;
            }
            const phoneE164 = asE164(phone);
            if (!phoneE164 || phoneE164.length < 6) {
                toast.error("Invalid phone number. Please enter E.164 format (e.g. +1555...).");
                return;
            }

            try {
                await api.post(
                    "/api/whatsapp/senders",
                    { wabaId: wabaId, phoneNumber: phoneE164, businessDisplayName: businessName },
                    { headers: { "X-Project-ID": projectId } }
                );
                toast.success("Sender registered successfully.");
            } catch (err) {
                console.error(err);
                toast.error("Failed to register sender.");
            }
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href={`.`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to WhatsApp account
                    </Button>
                </Link>
            </div>
            <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Register WhatsApp Sender</h3>
                <p className="leading-7 text-muted-foreground">Register your WhatsApp sender to start sending messages via WhatsApp.</p>
            </div>

            <div className="mt-6">
                <h3 className="scroll-m-18 text-l font-semibold tracking-tight mb-5">1. Select phone number to register</h3>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone number</label>
                    <Input type="tel" placeholder="+1 555 555 5555" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <p className="text-xs text-muted-foreground mb-6">Enter the same phone used in WhatsApp business account in international format (E.164).</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Business display name</label>
                    <Input type="text" placeholder="My Business" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    <p className="text-xs text-muted-foreground mb-6">Enter the display name for your WhatsApp business account.</p>
                </div>

                <h3 className="scroll-m-18 text-l font-semibold tracking-tight mb-5">2. Link WhatsApp business account with your number</h3>
                <div>
                    <Button onClick={launchWhatsAppSignup} style={{ backgroundColor: "#0866ff" }}>
                        Continue with Facebook
                    </Button>
                </div>
                <div className="mt-4 space-y-2">
                    <p className="text-xs text-muted-foreground">
                        Clicking "Continue with Facebook" will open a new window where you'll set up WhatsApp. Do not close or navigate away from this page until setup finishes.
                    </p>
                </div>

                <div className="mt-7 space-y-2">
                    {wabaId ? (
                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">WABA ID (auto-filled after Facebook setup)</label>
                            <div className="text-sm text-muted-foreground mt-1">{wabaId}</div>
                        </div>
                    ) : null}
                    <Button onClick={handleRegisterClick} disabled={registering || !phone} className="bg-gradient-primary">
                        {registering ? "Registering..." : "Register"}
                    </Button>
                </div>

            </div>
        </div>
    );
}