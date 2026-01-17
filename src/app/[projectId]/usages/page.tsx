'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Coins, Mail, MessageCircle, ExternalLink, Receipt } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useUser } from "@auth0/nextjs-auth0/client";
import { Progress } from "@/components/ui/progress";
import { Usage } from "@/models/subscription";


const paddleToken = process.env.NEXT_PUBLIC_PADDLE_TOKEN;
const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;
const paddleBillingPortalUrl = process.env.NEXT_PUBLIC_PADDLE_BILLING_PORTAL_URL;
const EMAIL_COST = 1; // 1 Email = 1 TCoin
const WHATSAPP_COST = 100; // 1 WhatsApp = 100 TCoins
let paddle: Paddle | undefined;

interface TCoinBundle {
    id: string;
    name: string;
    price: number;
    tcoins: number;
    priceId: string;
    popular?: boolean;
    discount?: number;
}

const TCOIN_BUNDLES: TCoinBundle[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 10,
        tcoins: 10000,
        priceId: process.env.NEXT_PUBLIC_PADDLE_TCOIN_STARTER_PRICE_ID || '',
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 50,
        tcoins: 60000,
        priceId: process.env.NEXT_PUBLIC_PADDLE_TCOIN_GROWTH_PRICE_ID || '',
        popular: true,
        discount: 20,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 100,
        tcoins: 130000,
        priceId: process.env.NEXT_PUBLIC_PADDLE_TCOIN_ENTERPRISE_PRICE_ID || '',
        discount: 30,
    },
];

export default function UsagesPage() {
    const params = useParams();
    const { projectId } = params as { projectId: string };
    const { user, error, isLoading } = useUser();

    const [usage, setUsage] = useState<Usage>();
    const [loading, setLoading] = useState(true);
    const [selectedBundle, setSelectedBundle] = useState<TCoinBundle | null>(null);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        setLoading(true);
        const script = document.createElement("script");
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
        script.async = true;

        script.onload = async () => {
            paddle = await initializePaddle({
                token: paddleToken || '',
                environment: paddleEnvironment as 'sandbox' | 'production',
                eventCallback: function (data) {
                    if (data.name == "checkout.completed") {
                        toast.success("Purchase successful! Reloading...");
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    }
                }
            });
            setLoading(false);
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Fetch usage
    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const res = await api.get(`/api/usage`, {
                    headers: {
                        "X-Project-ID": projectId
                    }
                });
                console.log("Usage data:", res.data);
                setUsage(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load usage data");
                setLoading(false);
            }
        };

        if (projectId) {
            fetchUsage();
        }
    }, [projectId]);

    const formatPrice = (price: number, currency: string) => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const formatTCoins = (amount: number) => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(0)}K`;
        }
        return amount.toLocaleString();
    };

    const handleBuyTCoins = async (bundle: TCoinBundle) => {
        if (!bundle.priceId) {
            toast.error("Bundle configuration error. Please contact support.");
            return;
        }

        if (paddle === null) {
            toast.error("Sorry, cannot proceed with the payment.");
            return;
        }

        setPurchasing(true);
        setSelectedBundle(bundle);

        try {
            const customer = {
                email: user?.email || '',
            };

            paddle?.Checkout?.open({
                settings: {
                    displayMode: "overlay",
                    variant: "one-page",
                    allowLogout: false
                },
                items: [
                    {
                        priceId: bundle.priceId,
                        quantity: 1
                    }
                ],
                customer: customer,
                customData: {
                    userId: user?.sub || 'user1',
                    projectId: projectId,
                    type: 'tcoin-purchase',
                    bundleId: bundle.id,
                    bundleName: bundle.name,
                    tcoinsAmount: bundle.tcoins
                }
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to initiate checkout");
        } finally {
            setPurchasing(false);
            setSelectedBundle(null);
        }
    };

    const handleManageBilling = () => {
        if (!paddleBillingPortalUrl) {
            toast.error("Billing portal URL is not configured");
            return;
        }
        window.open(paddleBillingPortalUrl, '_blank', 'noopener,noreferrer');
    };

    const usagePercentage = usage && usage.limit > 0 ? (usage.consumed / usage.limit) * 100 : 0;

    if (loading || isLoading) {
        return (
            <div className="p-8">
                <div className="text-center">Loading usages...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight">TCoins & Usage</h3>
                        <p className="text-muted-foreground mt-2">Manage your credits and track consumption</p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={handleManageBilling}
                        className="gap-2"
                    >
                        <Receipt className="w-4 h-4" />
                        Manage Billing & Invoices
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Current Usage Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-yellow-500" />
                            Current Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {usage && usage.limit > 0 ? (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">TCoins Balance</span>
                                        <span className="text-2xl font-bold">
                                            {formatTCoins(usage.limit - usage.consumed)}
                                        </span>
                                    </div>
                                    <Progress value={usagePercentage} className="h-2" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Used: {formatTCoins(usage.consumed)}</span>
                                        <span>Total: {formatTCoins(usage.limit)}</span>
                                    </div>
                                </div>

                                {usage.limit > 0 && usagePercentage > 80 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-sm text-orange-800">
                                            ⚠️ You've used {usagePercentage.toFixed(0)}% of your TCoins. Consider purchasing more credits below.
                                        </p>
                                    </div>
                                )}

                                {/* Usage Rates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email Cost</p>
                                            <p className="font-bold text-lg">{EMAIL_COST} TCoin</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">WhatsApp Cost</p>
                                            <p className="font-bold text-lg">{WHATSAPP_COST} TCoins</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-6">You don't have any TCoins yet</p>
                                <p className="text-sm text-muted-foreground">Purchase a bundle below to get started</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Buy TCoins Section */}
                <div>
                    <div className="mb-6">
                        <h4 className="text-xl font-semibold mb-2">Buy TCoins</h4>
                        <p className="text-sm text-muted-foreground">Choose a bundle that fits your needs</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TCOIN_BUNDLES.map((bundle) => (
                            <Card 
                                key={bundle.id} 
                                className={`relative transition-all hover:shadow-lg ${
                                    bundle.popular ? 'border-2 border-primary shadow-md' : 'border'
                                }`}
                            >
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                                    {bundle.popular && (
                                        <Badge className="bg-gradient-primary px-4">Most Popular</Badge>
                                    )}
                                    {bundle.discount && (
                                        <Badge variant="secondary" className="bg-green-500 text-white px-3">
                                            Save {bundle.discount}%
                                        </Badge>
                                    )}
                                </div>
                                <CardContent className="p-6 pt-8">
                                    <div className="text-center mb-6">
                                        <h3 className="font-bold text-xl mb-2">{bundle.name}</h3>
                                        <div className="flex items-baseline justify-center gap-1 mb-3">
                                            <span className="text-4xl font-bold text-primary">
                                                {formatPrice(bundle.price, 'USD')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-yellow-600">
                                            <Coins className="w-5 h-5" />
                                            <span className="text-2xl font-bold">{formatTCoins(bundle.tcoins)}</span>
                                            <span className="text-sm text-muted-foreground">TCoins</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center text-sm py-2 border-b">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Emails
                                            </span>
                                            <span className="font-semibold">~{(bundle.tcoins / EMAIL_COST).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm py-2 border-b">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <MessageCircle className="w-4 h-4" />
                                                WhatsApp
                                            </span>
                                            <span className="font-semibold">~{(bundle.tcoins / WHATSAPP_COST).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs py-2">
                                            <span className="text-muted-foreground">Cost per TCoin</span>
                                            <span className="font-medium">${(bundle.price / bundle.tcoins).toFixed(6)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        className={`w-full h-11 ${bundle.popular ? 'bg-gradient-primary' : ''}`}
                                        variant={bundle.popular ? 'default' : 'outline'}
                                        onClick={() => handleBuyTCoins(bundle)}
                                        disabled={purchasing}
                                        size="lg"
                                    >
                                        {purchasing && selectedBundle?.id === bundle.id ? (
                                            'Processing...'
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Buy Now
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-4">
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800 text-center font-medium">
                                ✓ Instant delivery • ✓ Secure payment • ✓ No expiry
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}