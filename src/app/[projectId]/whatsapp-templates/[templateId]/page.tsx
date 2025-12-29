'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Trash2, ExternalLink, Phone, Copy, Upload, X, RefreshCw, Edit, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod"
import type { TemplateType, ActionType, WhatsAppTemplate } from "@/models/whatsapp";

export default function WhatsappTemplatePage() {
    const params = useParams();
    const { projectId, templateId } = params as { projectId: string; templateId: string };
    const router = useRouter();

    const [template, setTemplate] = useState<WhatsAppTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
    const [templateStatus, setTemplateStatus] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    const languages = [
        { code: "en_US", label: "English (US)" },
        { code: "en_GB", label: "English (UK)" },
        { code: "es_LA", label: "Spanish (Latin America)" },
        { code: "pt_BR", label: "Portuguese (Brazil)" },
        { code: "ar", label: "Arabic" },
        { code: "fr_FR", label: "French (France)" },
    ];

    const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
        { value: "TEXT", label: "Text" },
        { value: "MEDIA", label: "Media" },
        { value: "CALL_TO_ACTION", label: "Call to action" },
    ];

    const ACTION_TYPES: { value: ActionType; label: string }[] = [
        { value: "URL", label: "Visit website" },
        { value: "PHONE_NUMBER", label: "Phone number" },
        { value: "COPY_CODE", label: "Copy code" },
    ];

    const actionSchema = z.object({
        type: z.enum(["URL", "PHONE_NUMBER", "COPY_CODE"] as const),
        title: z.string().min(1, "Title is required"),
        url: z.string().optional(),
        phone: z.string().optional(),
        code: z.string().optional(),
    });

    const schema = z.object({
        type: z.enum(["TEXT", "MEDIA", "CALL_TO_ACTION"] as const),
        name: z.string().min(1, "Name is required"),
        language: z.string().min(1, "Language is required"),
        body: z.string().min(1, "Body is required"),
        actions: z.array(actionSchema).optional(),
    });

    type FormValues = z.infer<typeof schema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: "TEXT",
            name: "",
            language: "en_US",
            body: "",
            actions: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "actions",
    });

    const selectedType = form.watch("type");
    const bodyText = form.watch("body");
    const actions = form.watch("actions");

    // Fetch template data
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/whatsapp/templates/${templateId}`, {
                    headers: { "X-Project-ID": projectId }
                });
                const data: WhatsAppTemplate = res.data;
                setTemplate(data);

                // Populate form with existing data
                form.reset({
                    type: data.type,
                    name: data.name,
                    language: data.language,
                    body: data.body,
                    actions: (data.actions || []).map(a => ({
                        type: a.type,
                        title: a.title,
                        url: a.url ?? undefined,
                        phone: a.phone ?? undefined,
                        code: a.code ?? undefined,
                    })),
                });

                // Set existing media URL if available
                if (data.media && data.media.length > 0) {
                    setExistingMediaUrl(data.media[0]);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load template");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [projectId, templateId, form]);

    // Fetch template status
    useEffect(() => {
        const fetchTemplateStatus = async () => {
            try {
                const res = await api.get(`/api/whatsapp/templates/${templateId}/status`, {
                    headers: { "X-Project-ID": projectId }
                });
                setTemplateStatus(res.data.value);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load template status");
            }
        };

        fetchTemplateStatus();
    }, [projectId, templateId]);

    const handleVerifyStatus = async () => {
        try {
            setVerifying(true);
            const res = await api.get(`/api/whatsapp/templates/${templateId}/status`, {
                headers: { "X-Project-ID": projectId }
            });
            setTemplateStatus(res.data.value);
            toast.success("Status updated");
        } catch (err) {
            console.error(err);
            toast.error("Failed to verify status");
        } finally {
            setVerifying(false);
        }
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            // Clear existing media URL when uploading new file
            setExistingMediaUrl(null);
        }
    };

    const removeMediaFile = () => {
        setMediaFile(null);
        setExistingMediaUrl(null);
    };

    const handleSubmitForApproval = async () => {
        try {
            await api.post(`/api/whatsapp/templates/${templateId}/approval/submit`, {}, {
                headers: { "X-Project-ID": projectId }
            });
            toast.success("Template submitted for approval");
            setTemplateStatus("submitted"); // Update status locally
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit template");
        }
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return null;

        const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
            unsubmitted: { variant: "secondary", label: "Unsubmitted" },
            submitted: { variant: "outline", label: "Submitted" },
            approved: { variant: "default", label: "Approved" },
            rejected: { variant: "destructive", label: "Rejected" },
        };

        const config = statusConfig[status.toLowerCase()] || { variant: "outline" as const, label: status };

        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const onSubmit = async (values: FormValues) => {
        try {
            // Build the template payload matching WhatsAppTemplate model
            const templatePayload: Partial<WhatsAppTemplate> = {
                id: templateId,
                name: values.name,
                language: values.language,
                body: values.body,
                type: values.type,
                category: template?.category || "MARKETING",
                variables: template?.variables || [],
                media: existingMediaUrl ? [existingMediaUrl] : [],
                actions: [],
            };

            // Handle CALL_TO_ACTION type
            if (values.type === "CALL_TO_ACTION" && values.actions) {
                templatePayload.actions = values.actions.map(a => ({
                    type: a.type,
                    title: a.title,
                    url: a.type === "URL" ? (a.url || null) : null,
                    phone: a.type === "PHONE_NUMBER" ? (a.phone || null) : null,
                    code: a.type === "COPY_CODE" ? (a.code || null) : null,
                }));
            }

            const formData = new FormData();
            const templateBlob = new Blob([JSON.stringify(templatePayload)], { type: "application/json" });
            formData.append("data", templateBlob);
            if (mediaFile) {
                formData.append("files", mediaFile);
            }

            await api.post(`/api/whatsapp/templates`, formData, {
                headers: {
                    "X-Project-ID": projectId,
                    // Let browser set Content-Type for multipart/form-data
                }
            });

            toast.success("Template updated");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update template");
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">Loading template...</div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="p-6">
                <div className="text-center text-muted-foreground">Template not found</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <Link href={`/${projectId}/whatsapp-templates`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Templates
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Edit WhatsApp Template</h3>
                        {getStatusBadge(templateStatus)}
                    </div>
                    <p className="leading-7">Update template details</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleVerifyStatus}
                        disabled={verifying}
                    >
                        <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                        Verify Status
                    </Button>
                    {templateStatus === "unsubmitted" && (
                        <Button
                            type="button"
                            className="flex items-center gap-2 bg-gradient-primary"
                            onClick={handleSubmitForApproval}
                        >
                            Submit for approval
                        </Button>
                    )}
                </div>
            </div>

            {/* Important Note Alert */}
            {templateStatus !== "approved" && (
                <Alert className="mt-6 border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>Important:</strong> This template must be approved by WhatsApp before it can be used in campaigns. 
                        {templateStatus === "unsubmitted" && " Please submit it for approval first."}
                        {templateStatus === "submitted" && " Your template is currently under review."}
                        {templateStatus === "rejected" && " Your template was rejected. Please create a new one and make the required changes before submit."}
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-6 flex gap-6 w-full">
                <div className="flex-[8]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Template name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template type</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TEMPLATE_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value}>
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {languages.map(l => (
                                                        <SelectItem key={l.code} value={l.code}>
                                                            {l.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {selectedType === "MEDIA" && (
                                <div className="border rounded p-4 space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-semibold">Media File</h4>
                                        <label htmlFor="media-upload">
                                            <Button type="button" size="sm" asChild>
                                                <span className="flex items-center gap-2 cursor-pointer">
                                                    <Upload className="w-4 h-4" />
                                                    {existingMediaUrl || mediaFile ? "Replace Media" : "Upload Media"}
                                                </span>
                                            </Button>
                                            <input
                                                id="media-upload"
                                                type="file"
                                                accept="image/*,video/*"
                                                className="hidden"
                                                onChange={handleMediaUpload}
                                            />
                                        </label>
                                    </div>

                                    {!mediaFile && !existingMediaUrl && (
                                        <p className="text-sm text-muted-foreground">No media file uploaded yet.</p>
                                    )}

                                    {/* Show existing media */}
                                    {existingMediaUrl && !mediaFile && (
                                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={existingMediaUrl}
                                                        alt="Existing media"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Current media</p>
                                                    <p className="text-xs text-muted-foreground">From server</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={removeMediaFile}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Show new uploaded media */}
                                    {mediaFile && (
                                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                                    {mediaFile.type.startsWith('image/') ? (
                                                        <img
                                                            src={URL.createObjectURL(mediaFile)}
                                                            alt={mediaFile.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Upload className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{mediaFile.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(mediaFile.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={removeMediaFile}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="body"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Body</FormLabel>
                                        <FormControl>
                                            <textarea
                                                {...field}
                                                rows={8}
                                                className="w-full border rounded p-2 text-sm"
                                                placeholder="Template body (use placeholders as needed)"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {selectedType === "CALL_TO_ACTION" && (
                                <div className="border rounded p-4 space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-semibold">Buttons</h4>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => append({ type: "URL", title: "", url: "", phone: "", code: "" })}
                                        >
                                            Add Button
                                        </Button>
                                    </div>

                                    {fields.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No buttons added yet.</p>
                                    )}

                                    {fields.map((field, index) => {
                                        const actionType = form.watch(`actions.${index}.type`);
                                        return (
                                            <div key={field.id} className="border rounded p-3 space-y-3">
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-1 space-y-3">
                                                        <FormField
                                                            control={form.control}
                                                            name={`actions.${index}.type`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Action type</FormLabel>
                                                                    <FormControl>
                                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                                            <SelectTrigger className="w-full">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {ACTION_TYPES.map(t => (
                                                                                    <SelectItem key={t.value} value={t.value}>
                                                                                        {t.label}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </FormControl>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {actionType === "URL" && "Opens a website when the button is clicked"}
                                                                        {actionType === "PHONE_NUMBER" && "Initiates a phone call when the button is clicked"}
                                                                        {actionType === "COPY_CODE" && "Copies a code to clipboard when the button is clicked"}
                                                                    </p>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name={`actions.${index}.title`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Title</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Button title"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {actionType === "URL" && (
                                                            <FormField
                                                                control={form.control}
                                                                name={`actions.${index}.url`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>URL</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="https://example.com" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}

                                                        {actionType === "PHONE_NUMBER" && (
                                                            <FormField
                                                                control={form.control}
                                                                name={`actions.${index}.phone`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Phone</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="+1234567890" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}

                                                        {actionType === "COPY_CODE" && (
                                                            <FormField
                                                                control={form.control}
                                                                name={`actions.${index}.code`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Code</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="PROMO123" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                        className="mt-8"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {templateStatus === "unsubmitted" && (
                                <div className="flex justify-start gap-2">
                                    <Button variant="outline" type="submit">
                                        <Edit className="w-4 h-4" /> Update Template
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </div>

                {/* Preview section */}
                <div className="flex-[4]">
                    <div className="sticky top-6">
                        <h4 className="text-sm font-semibold mb-3">Preview</h4>
                        <div className="bg-[#e5ddd5] p-4 rounded-lg">
                            {/* WhatsApp message bubble */}
                            <div className="bg-white rounded-lg shadow-sm p-3 max-w-sm">
                                {selectedType === "MEDIA" && (mediaFile || existingMediaUrl) && (
                                    <div className="mb-3">
                                        {mediaFile ? (
                                            mediaFile.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(mediaFile)}
                                                    alt="Media preview"
                                                    className="w-full rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                                                    <Upload className="w-12 h-12 text-gray-400" />
                                                </div>
                                            )
                                        ) : existingMediaUrl ? (
                                            <img
                                                src={existingMediaUrl}
                                                alt="Media preview"
                                                className="w-full rounded"
                                            />
                                        ) : null}
                                    </div>
                                )}

                                <div className="text-sm whitespace-pre-wrap break-words">
                                    {bodyText || "Template body will appear here..."}
                                </div>

                                {/* Action buttons */}
                                {selectedType === "CALL_TO_ACTION" && actions && actions.length > 0 && (
                                    <div className="mt-3 space-y-2 border-t pt-3">
                                        {actions.map((action, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:bg-gray-50 rounded border border-gray-200"
                                                disabled
                                            >
                                                {action.type === "URL" && <ExternalLink className="w-4 h-4" />}
                                                {action.type === "PHONE_NUMBER" && <Phone className="w-4 h-4" />}
                                                {action.type === "COPY_CODE" && <Copy className="w-4 h-4" />}
                                                <span>{action.title || "Button title"}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Message timestamp */}
                                <div className="text-xs text-gray-500 mt-2 text-right">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}