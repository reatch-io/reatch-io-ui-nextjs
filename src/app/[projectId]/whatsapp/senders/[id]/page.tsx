"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Sender, SenderProfile } from "@/models/whatsapp";
import { ArrowLeft } from "lucide-react";
import { InfoBox } from "@/components/ui/info-box";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const VERTICALS = [
  "Alcoholic Beverages",
  "Clothing and Apparel",
  "Automotive",
  "Beauty, Spa and Salon",
  "Education",
  "Entertainment",
  "Event Planning and Service",
  "Finance and Banking",
  "Public Service",
  "Food and Grocery",
  "Medical and Health",
  "Hotel and Lodging",
  "Non-profit",
  "Online Gambling & Gaming",
  "Over-the-Counter Drugs",
  "Other",
  "Non-Online Gambling & Gaming (E.g. Brick and mortar)",
  "Professional Services",
  "Restaurant",
  "Shopping and Retail",
  "Travel and Transportation",
];

// local profile type extended with client-only fields for the uploaded file bytes/preview
type LocalProfile = Partial<SenderProfile> & {
  logoBytes?: Uint8Array;
  logoPreview?: string;
  logoName?: string;
  logoFile?: File;
};

export default function SenderDetailsPage() {
  const { projectId, id } = useParams() as { projectId: string; id: string };
  const [loading, setLoading] = useState(true);
  const [sender, setSender] = useState<Sender | null>(null);

  // local editable profile state (use Partial so fields can be optional while editing)
  const [profileState, setProfileState] = useState<LocalProfile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  // read selected file as bytes (no upload) and keep a preview URL
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const preview = URL.createObjectURL(file);
      // keep original File so we can send it in multipart form-data
      setProfileState(prev => ({ ...(prev ?? {}), logoBytes: bytes, logoPreview: preview, logoName: file.name, logoFile: file }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to read file.");
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (!projectId || !id) return;
    setLoading(true);
    api
      .get(`/api/whatsapp/senders/${id}`, { headers: { "X-Project-ID": projectId } })
      .then((res) => {
        setSender(res.data ?? null);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load sender.");
      })
      .finally(() => setLoading(false));
  }, [projectId, id]);

  // populate local profile when sender loads
  useEffect(() => {
    if (!sender) {
      // clear local profile state when sender not loaded
      setProfileState(null);
      return;
    }
    // create shallow copy to avoid mutating original
    setProfileState({
      about: sender.profile?.about ?? null,
      vertical: sender.profile?.vertical ?? null,
      // normalize lists: filter out empty strings so we never keep [""] entries
      websites: (sender.profile?.websites ?? []).filter(Boolean),
      address: sender.profile?.address ?? null,
      // use logoPreview to show either a blob preview (client) or server URL returned as logoUrl
      logoPreview: sender.profile?.logoUrl ?? undefined,
      emails: (sender.profile?.emails ?? []).filter(Boolean),
      description: sender.profile?.description ?? null,
    });
  }, [sender]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!sender) {
    return (
      <div>
        <div className="p-6">
          <p className="mb-4 text-sm text-muted-foreground">Sender not found.</p>
          <Link href={`/${projectId}/whatsapp`}>
            <Button>Back to senders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const saveProfile = async () => {
    if (!projectId || !id || !profileState) return;
    setSavingProfile(true);
    try {
      // exclude client-only fields from JSON payload
      const { logoFile, logoBytes, logoPreview, logoName, ...profileFields } = profileState as LocalProfile;

      // normalize arrays before sending: ensure empty lists are [] (not [""])
      if (profileFields.emails) {
        profileFields.emails = (profileFields.emails as string[]).filter(Boolean);
      } else {
        profileFields.emails = [];
      }
      if (profileFields.websites) {
        profileFields.websites = (profileFields.websites as string[]).filter(Boolean);
      } else {
        profileFields.websites = [];
      }

      // ensure text fields are null when empty (about, vertical, address, description)
      const normalizeToNull = (v: any) => {
        if (v === null || v === undefined) return null;
        if (typeof v === "string") {
          const s = v.trim();
          return s === "" ? null : s;
        }
        return v;
      };
      profileFields.about = normalizeToNull(profileFields.about);
      profileFields.vertical = normalizeToNull(profileFields.vertical);
      profileFields.address = normalizeToNull(profileFields.address);
      profileFields.description = normalizeToNull(profileFields.description);

      const form = new FormData();
      // append profile as a JSON blob so that this part has Content-Type: application/json
      const profileBlob = new Blob([JSON.stringify(profileFields)], { type: "application/json" });
      form.append("profile", profileBlob);

      // append file part (multipart)
      if (logoFile) {
        form.append("file", logoFile, logoFile.name);
      }

      const res = await api.post(`/api/whatsapp/senders/${id}`, form, {
        headers: {
          "X-Project-ID": projectId,
          // do NOT set Content-Type here — let the browser set the multipart boundary
        },
      });

      // server should return updated sender (with profile.logoUrl)
      const updatedSender = res.data;
      if (updatedSender) {
        setSender(updatedSender);
        // update local profile state to reflect server values (use returned logo URL as preview)
        setProfileState(prev => {
          const { logoBytes, logoFile, logoName, logoPreview, ...rest } = (prev ?? {}) as LocalProfile;
          return {
            ...rest,
            about: updatedSender.profile?.about ?? null,
            vertical: updatedSender.profile?.vertical ?? null,
            websites: (updatedSender.profile?.websites ?? []).filter(Boolean),
            address: updatedSender.profile?.address ?? null,
            emails: (updatedSender.profile?.emails ?? []).filter(Boolean),
            description: updatedSender.profile?.description ?? null,
            logoPreview: updatedSender.profile?.logoUrl ?? undefined,
          } as LocalProfile;
        });
      }
      toast.success("Profile updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href={`/${projectId}/whatsapp`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to WhatsApp account
          </Button>
        </Link>
      </div>
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          WhatsApp Sender: {sender.profile?.name ?? ""}
        </h3>
        <p className="leading-7 text-muted-foreground">
          View detailed information about your WhatsApp sender.
        </p>
      </div>
      <div className="mt-5">
        <div className="space-y-4">
          <div>
            <div className="flex flex-row gap-4 mt-6 w-full">
              <InfoBox
                title={sender.status ?? "—"}
                description="Status"
                titleClassName="text-lg "

              />
              <InfoBox
                title={(sender.phoneNumber ?? "").replaceAll("whatsapp:", "") || "—"}
                description="Phone number"
                titleClassName="text-lg"
              />
              <InfoBox
                title={sender.messagingLimit ?? "—"}
                description="Messaging limit"
                titleClassName="text-lg"
              />
              <InfoBox
                title={sender.qualityRating ?? "—"}
                description="Quality rating"
                titleClassName="text-lg"
              />
            </div>
          </div>

          <div className="border rounded p-4">
            <h4 className="text-sm font-medium mb-2">Profile</h4>
            {profileState ? (
              <div className="grid gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">About</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={profileState.about ?? ""}
                    onChange={e =>
                      setProfileState(prev => ({ ...(prev ?? {}), about: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Vertical</label>
                  <Select
                    value={profileState.vertical ?? ""}
                    onValueChange={(v: string) =>
                      setProfileState(prev => ({ ...(prev ?? {}), vertical: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select vertical" />
                    </SelectTrigger>
                    <SelectContent>
                      {VERTICALS.map(v => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Address</label>
                  <Input
                    value={profileState.address ?? ""}
                    onChange={e => setProfileState(prev => ({ ...(prev ?? {}), address: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded overflow-hidden border bg-gray-50 flex items-center justify-center">
                      {profileState?.logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileState.logoPreview} alt={profileState.logoName || "logo"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-muted-foreground px-2">No logo</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (profileState?.logoPreview && profileState.logoPreview.startsWith?.("blob:")) {
                              URL.revokeObjectURL(profileState.logoPreview);
                            }
                            setProfileState(prev => ({ ...(prev ?? {}), logoBytes: undefined, logoPreview: undefined, logoName: undefined, logoFile: undefined }));
                          }}
                          disabled={uploadingLogo || !profileState?.logoPreview}
                        >
                          Remove
                        </Button>
                        {uploadingLogo && <div className="text-sm text-muted-foreground">Reading file...</div>}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Emails (comma separated)</label>
                  <Input
                    value={(profileState.emails || []).join(", ")}
                    onChange={e =>
                      setProfileState(prev => ({
                        ...(prev ?? {}),
                        emails: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Websites (comma separated)</label>
                  <Input
                    value={(profileState.websites || []).join(", ")}
                    onChange={e =>
                      setProfileState(prev => ({
                        ...(prev ?? {}),
                        websites: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={profileState.description ?? ""}
                    onChange={e =>
                      setProfileState(prev => ({ ...(prev ?? {}), description: e.target.value }))
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading profile...</div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button
              onClick={saveProfile}
            >
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
