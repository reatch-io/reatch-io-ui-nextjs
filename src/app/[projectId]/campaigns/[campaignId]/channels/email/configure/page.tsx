"use client";

export default function EmailChannelConfigurePage() {
    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Configure Email Channel</h1>
            <p className="mb-6 text-muted-foreground">
                Here you can configure the email channel settings for your campaign.
            </p>
            {/* Add your configuration form or content here */}
            <div className="border rounded p-6 bg-white shadow">
                <div className="mb-4">
                    <label className="block font-medium mb-1">Sender Email</label>
                    <input
                        type="email"
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g. marketing@yourdomain.com"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-medium mb-1">Sender Name</label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g. Your Company"
                    />
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded" type="button">
                    Save Settings
                </button>
            </div>
        </div>
    );
}