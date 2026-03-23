"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface ProfileModalProps {
    userEmail: string;
    onClose: () => void;
    onSignOut: () => void;
    onProfileUpdate: (profile: { name: string; bio: string; avatarUrl: string }) => void;
}

export const ProfileModal = ({ userEmail, onClose, onSignOut, onProfileUpdate }: ProfileModalProps) => {
    const supabase = createClient();
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await supabase.from("user_profiles").select("*").eq("email", userEmail).single();
            if (data) {
                setName(data.name || "");
                setBio(data.bio || "");
                setAvatarUrl(data.avatar_url || "");
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, [userEmail]);

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsSaving(true);
            const fileExt = file.name.split('.').pop();
            const filePath = `${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            
            setAvatarUrl(publicUrl);
            await handleSave(publicUrl); // auto-save on image upload
        } catch (error: any) {
            console.error("Upload error:", error);
            alert("Error uploading avatar: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async (overrideAvatarUrl?: string) => {
        setIsSaving(true);
        const finalUrl = overrideAvatarUrl || avatarUrl;
        try {
            const { error } = await supabase.from("user_profiles").upsert({
                email: userEmail,
                name,
                bio,
                avatar_url: finalUrl,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            onProfileUpdate({ name, bio, avatarUrl: finalUrl });
        } catch (error: any) {
            console.error("Save error:", error);
            alert("Error saving profile: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface-panel w-[400px] border border-border-subtle rounded-3xl shadow-2xl p-6 relative animate-scale-in">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-base hover:bg-white/10 text-text-secondary transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-xl font-bold font-outfit text-white mb-6">Profile Settings</h2>

                {isLoading ? (
                    <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div></div>
                ) : (
                    <div className="space-y-5">
                        {/* Avatar Section */}
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-primary border-2 border-border-subtle shrink-0">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl uppercase">
                                        {name ? name.charAt(0) : userEmail.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                                <button onClick={handleUploadClick} disabled={isSaving} className="px-3 py-1.5 bg-surface-base hover:bg-white/5 border border-border-subtle rounded-lg text-xs font-bold text-text-primary transition-colors cursor-pointer disabled:opacity-50">
                                    {isSaving && !name ? "Uploading..." : "Upload Photo"}
                                </button>
                                <p className="text-[10px] text-text-secondary mt-1">Recommended size: 200x200px</p>
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Display Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="E.g. John Doe"
                                className="w-full bg-[#1A1A22] border border-white/5 rounded-xl px-4 py-2 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-brand-primary transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Agent Bio</label>
                            <textarea 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                                placeholder="Write a short bio about your role..."
                                rows={3}
                                className="w-full bg-[#1A1A22] border border-white/5 rounded-xl px-4 py-2 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-brand-primary transition-colors resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex items-center justify-between border-t border-border-subtle mt-4">
                            <button onClick={onSignOut} className="text-xs font-bold text-rose-500 hover:text-rose-400 uppercase tracking-wider cursor-pointer transition-colors p-2">
                                Sign Out
                            </button>
                            <button 
                                onClick={() => handleSave()} 
                                disabled={isSaving}
                                className="px-5 py-2 bg-brand-primary hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-brand-primary/20 disabled:opacity-50 cursor-pointer"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
