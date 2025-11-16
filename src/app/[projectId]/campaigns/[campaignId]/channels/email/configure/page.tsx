"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/auth/app-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/mode-html";
import "ace-builds/src-min-noconflict/worker-html";
import "ace-builds/src-min-noconflict/theme-xcode";
import { TagsInput } from "@/components/ui/tags-input";

type EmailConfig = {
    campaignId?: string;
    from: string;
    replyTo?: string[] | null;
    bcc?: string[] | null;
    subject?: string | null;
    content: string;
    status?: string | null;
};

export default function EmailChannelConfigurePage() {
    const { projectId, campaignId } = useParams() as { projectId: string; campaignId: string };
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<EmailConfig>({
        campaignId: campaignId,
        from: "",
        replyTo: null,
        bcc: null,
        subject: null,
        content: "",
        status: null,
    });

    useEffect(() => {
        if (!projectId || !campaignId) return;
        setLoading(true);
        api.get(`/api/email/${campaignId}`, { headers: { "X-Project-ID": projectId } })
            .then((res) => {
                const data = res.data || {};
                setConfig({
                    campaignId: campaignId,
                    from: data.from || "",
                    replyTo: (() => {
                        if (data.replyTo == null) return null;
                        if (Array.isArray(data.replyTo)) return data.replyTo;
                        if (typeof data.replyTo === "string") {
                            return data.replyTo.split(/[,;]\s*/).map((s: string) => s.trim()).filter(Boolean);
                        }
                        return null;
                    })(),
                    bcc: (() => {
                        if (data.bcc == null) return null;
                        if (Array.isArray(data.bcc)) return data.bcc;
                        if (typeof data.bcc === "string") {
                            return data.bcc.split(/[,;]\s*/).map((s: string) => s.trim()).filter(Boolean);
                        }
                        return null;
                    })(),
                    subject: data.subject ?? null,
                    content: data.content || "",
                    status: data.status ?? null,
                });
            })
            .catch(() => {
                toast.error("Failed to load email configuration.");
            })
            .finally(() => setLoading(false));
    }, [projectId, campaignId]);

    const validate = (c: EmailConfig) => {
        if (!c.from.trim()) return "From is required.";
        if (!c.content.trim()) return "Content is required.";
        return null;
    };

    // Helper to wrap provided HTML into a full HTML email document (includes headers)
    function buildFullHtml(cfg: EmailConfig) {
        const safeBody = cfg.content || "<p></p>";
        const show = (v: string[] | string | null | undefined) => {
            if (!v) return "—";
            if (Array.isArray(v)) return v.join(", ");
            return v;
        };
        // include From/Reply/BCC/Subject inside preview wrapper if needed by caller
        return safeBody;
    }

    // default template to apply
    const DEFAULT_TEMPLATE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to Reatch.io</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width:600px) {
      .container { width:100% !important; }
      .content { padding:16px !important; }
      .btn td { padding:12px 18px !important; }
      .hero { font-size:24px !important; line-height:30px !important; }
    }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">

  <!-- Preheader text -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    Welcome to Reatch.io — let’s help you reach your customers smarter.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!-- Container -->
        <table width="600" class="container" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff; border-radius:8px; overflow:hidden; width:600px; max-width:600px; box-shadow:0 2px 6px rgba(0,0,0,0.05);">

          <!-- Hero section -->
          <tr>
            <td class="content" style="padding:28px;">
              <h1 class="hero" style="margin:0; font-size:28px; line-height:34px; color:#0f172a; font-weight:700;">
                Welcome to Reatch.io 🎉
              </h1>
              <p style="margin:12px 0 0; font-size:16px; color:#334155; line-height:24px;">
                We're excited to help you create smarter, more personalized customer engagement.  
                Here's how to get started.
              </p>
            </td>
          </tr>

          <!-- Steps -->
          <tr>
            <td class="content" style="padding:0 28px 24px;">
              <table width="100%" role="presentation">
                <tr>
                  <td style="padding-bottom:12px;">
                    <strong style="font-size:16px; color:#0f172a;">1. Add your email domain</strong>
                    <p style="margin:6px 0 16px; font-size:14px; color:#475569; line-height:20px;">
                      Verify your sending domain to start reaching customers with high deliverability.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <strong style="font-size:16px; color:#0f172a;">2. Connect your WhatsApp sender</strong>
                    <p style="margin:6px 0 16px; font-size:14px; color:#475569; line-height:20px;">
                      Set up your WhatsApp business sender to deliver messages directly to your audience.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <strong style="font-size:16px; color:#0f172a;">3. Create your first campaign</strong>
                    <p style="margin:6px 0 16px; font-size:14px; color:#475569; line-height:20px;">
                      Build a scheduled, event-based, or API-triggered campaign and watch the magic happen.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                <tr>
                  <td>
                    <table role="presentation" class="btn">
                      <tr>
                        <td style="background:#2563eb; padding:14px 26px; border-radius:6px;">
                          <a href="https://www.reatch.io" target="_blank" style="color:#fff; text-decoration:none; font-size:15px; font-weight:600;">
                            Start Now
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:18px 0 0; font-size:14px; color:#64748b;">
                Need help? Our team is always ready — just reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px; border-top:1px solid #e6ebf1; font-size:12px; color:#94a3b8;">
              <strong>Reatch.io</strong><br/>
              <a href="{{unsubscribe_url}}" style="color:#94a3b8; text-decoration:underline;">Unsubscribe</a>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

    // apply default template (confirm overwrite if editor not empty)
    const applyDefaultTemplate = () => {
        if (config.content && config.content.trim() !== "") {
            const ok = window.confirm("Replace existing HTML with default template?");
            if (!ok) return;
        }
        setConfig(prev => ({ ...prev, content: DEFAULT_TEMPLATE }));
    };

    const handleSave = () => {
        const err = validate(config);
        if (err) {
            toast.error(err);
            return;
        }
        setSaving(true);
        const payload = {
            ...config,
            content: buildFullHtml(config),
        };
        api.post(`/api/email`, payload, { headers: { "X-Project-ID": projectId } })
            .then(() => {
                toast.success("Email configuration saved.");
            })
            .catch(() => toast.error("Failed to save configuration."))
            .finally(() => setSaving(false));
    };

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    return (
        <div className="p-8 mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Link href={`/${projectId}/campaigns/${campaignId}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Campaign
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Configure Email Channel</h1>
                <p className="text-sm text-muted-foreground mt-1">Configure the email channel for this campaign.</p>
            </div>

            {/* Split page horizontally: left = inputs (small), right = content (flexible) */}
            <div className="md:grid md:grid-cols-[320px_1fr] md:gap-8 gap-6">
                {/* Left column: inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">From (required)</label>
                        <Input value={config.from} onChange={e => setConfig(prev => ({ ...prev, from: e.target.value }))} />
                        <p className="text-xs text-muted-foreground mt-1">
                            The From address must use a domain configured on the Domains page.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Reply To</label>
                        <TagsInput
                            value={config.replyTo ?? []}
                            onChange={(items: string[]) => setConfig(prev => ({ ...prev, replyTo: items.length ? items : null }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">BCC</label>
                        <TagsInput
                            value={config.bcc ?? []}
                            onChange={(items: string[]) => setConfig(prev => ({ ...prev, bcc: items.length ? items : null }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Subject</label>
                        <Input
                            value={config.subject ?? ""}
                            onChange={e => {
                                const v = e.target.value;
                                setConfig(prev => ({ ...prev, subject: v.trim() === "" ? null : v }));
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <label className="inline-flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={config.status === "ACTIVE"}
                                onChange={(e) =>
                                    setConfig(prev => ({ ...prev, status: e.target.checked ? "ACTIVE" : null }))
                                }
                                className="h-4 w-4 rounded border-gray-300"
                                aria-checked={config.status === "ACTIVE"}
                            />
                            <span className="text-sm">{config.status === "ACTIVE" ? "Active" : "Inactive"}</span>
                        </label>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary">
                            {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Right column: HTML source (left) and preview (right) — horizontally aligned on md+ */}
                <div className="flex flex-col md:flex-row md:items-start gap-4 md:h-[calc(100vh-300px)]">
                    {/* HTML Source on the left */}
                    <div className="md:w-1/2 w-full h-full">
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium">HTML Source</label>
                            <button
                                type="button"
                                onClick={applyDefaultTemplate}
                                className="text-sm px-2 py-1 rounded border bg-gray-50 hover:bg-gray-100"
                            >
                                Apply default template
                            </button>
                        </div>
                        <div className="border rounded h-full">
                            <AceEditor
                                className="w-full"
                                mode="html"
                                theme="xcode"
                                onChange={e => setConfig(prev => ({ ...prev, content: e }))}
                                name="EMAIL_HTML_EDITOR"
                                editorProps={{ $blockScrolling: true }}
                                highlightActiveLine={true}
                                width="100%"
                                height="100%"
                                setOptions={{
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    enableSnippets: true,
                                    showLineNumbers: true,
                                    tabSize: 2,
                                }}
                                value={config.content}
                            />
                        </div>
                    </div>

                    {/* Preview on the right */}
                    <div className="md:w-1/2 w-full h-full">
                        <label className="block text-sm font-medium mb-1">Preview</label>
                        <div className="mb-2 text-xs text-muted-foreground space-y-1">
                            <div><strong>From:</strong> {config.from || "—"}</div>
                            <div><strong>Reply-To:</strong> {(config.replyTo && config.replyTo.length) ? config.replyTo.join(", ") : "—"}</div>
                            <div><strong>BCC:</strong> {(config.bcc && config.bcc.length) ? config.bcc.join(", ") : "—"}</div>
                            <div><strong>Subject:</strong> {config.subject || "—"}</div>
                        </div>
                        <iframe
                            className="w-full border rounded bg-white"
                            title="Email preview"
                            srcDoc={buildFullHtml(config)}
                            sandbox="allow-same-origin allow-popups allow-forms"
                            style={{ height: "calc(100vh - 375px)", width: "100%", border: 0 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}