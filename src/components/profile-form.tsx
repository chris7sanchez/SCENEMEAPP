'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ETHNICITIES } from "@/lib/data";
import { UserProfile } from "@/lib/types";
import { Upload, User, Video, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
    onComplete: (profile: UserProfile) => void;
    initialEmail: string;
}

export default function ProfileForm({ onComplete, initialEmail }: ProfileFormProps) {
    const [profile, setProfile] = useState<UserProfile>({
        email: initialEmail,
        firstName: "",
        lastName: "",
        phone: "",
        eyeColor: "",
        hairColor: "",
        height: "",
        ethnicity: "",
        experience: "",
        languages: "",
        photos: [],
        video: null
    });

    const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'video') => {
        if (e.target.files && e.target.files.length > 0) {
            if (type === 'photos') {
                setProfile({ ...profile, photos: Array.from(e.target.files) });
            } else {
                const file = e.target.files[0];
                if (file.size > 100 * 1024 * 1024) { // 100MB limit
                    setErrors({ ...errors, video: "El video no puede superar los 100MB" });
                } else {
                    setProfile({ ...profile, video: file });
                    setErrors({ ...errors, video: undefined });
                }
            }
        }
    };

    const validate = () => {
        const newErrors: any = {};
        if (!profile.firstName) newErrors.firstName = "Requerido";
        if (!profile.lastName) newErrors.lastName = "Requerido";
        if (!profile.phone) newErrors.phone = "Requerido";
        if (!profile.ethnicity) newErrors.ethnicity = "Requerido";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsUploading(true);
            try {
                // Dynamic import to avoid SSR issues with auth/storage
                const { auth } = await import('@/lib/auth');

                // Try to import storage, but handle failure if not configured
                let storageModule;
                try {
                    storageModule = await import('@/lib/storage');
                } catch (e) {
                    console.warn("Storage module not available", e);
                }

                const user = await auth.getCurrentUser();
                if (!user) {
                    throw new Error("No user found");
                }

                let photoUrls: string[] = [];
                let videoUrl = null;

                if (storageModule) {
                    const { uploadUserAvatar, uploadFile } = storageModule;

                    if (profile.photos && profile.photos.length > 0) {
                        // Upload first photo as avatar
                        try {
                            const avatarUrl = await uploadUserAvatar(user.uid, profile.photos[0]);
                            photoUrls.push(avatarUrl);
                        } catch (e) {
                            console.error("Avatar upload failed", e);
                            toast({ title: "Error al subir foto", description: "No se pudo guardar la foto de perfil.", variant: "destructive" });
                        }

                        // Upload remaining photos
                        for (let i = 1; i < profile.photos.length; i++) {
                            try {
                                const url = await uploadFile(profile.photos[i], `users/${user.uid}/photos/${profile.photos[i].name}`);
                                photoUrls.push(url);
                            } catch (e) {
                                console.error(`Photo ${i} upload failed`, e);
                            }
                        }
                    }

                    try {
                        if (profile.video) {
                            videoUrl = await uploadFile(profile.video, `users/${user.uid}/videos/${profile.video.name}`);
                        }
                    } catch (videoError) {
                        console.warn("Video upload failed, continuing without video:", videoError);
                        toast({ title: "Error al subir video", description: "El video no se pudo guardar. Intenta con un enlace.", variant: "destructive" });
                    }
                }

                const profileWithUrls = {
                    ...profile,
                    photos: photoUrls.length > 0 ? photoUrls : profile.photos, // Keep original files if upload failed/skipped so UI doesn't break immediately
                    video: videoUrl || profile.video
                };

                // If we have files but no URLs (upload failed), we might want to strip the files before saving to Firestore to avoid "cannot save custom object" error
                // Firestore cannot save File objects.
                const profileForFirestore = {
                    ...profileWithUrls,
                    photos: photoUrls, // Only save URLs
                    video: videoUrl // Only save URL
                };

                onComplete(profileForFirestore as any);

            } catch (error: any) {
                console.error("Error uploading files:", error);

                // Show a more specific message so the user knows what happened
                let errorMessage = "Hubo un problema al subir los archivos.";
                if (error.code === 'storage/unauthorized') {
                    errorMessage = "No tienes permiso para subir archivos. Se guardarán solo tus datos.";
                } else if (error.message) {
                    errorMessage = `Error de subida: ${error.message}. Se guardarán solo tus datos.`;
                }

                toast({
                    title: "Perfil actualizado",
                    description: errorMessage,
                    variant: "default",
                    className: "bg-yellow-500 text-white border-none"
                });

                // Even if upload fails critically, try to save text data (stripping files)
                const profileClean = {
                    ...profile,
                    photos: [],
                    video: null
                };
                onComplete(profileClean);
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-card border border-white/10 rounded-xl shadow-2xl">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-display text-primary mb-2">Perfil del Actor</h2>
                <p className="text-muted-foreground">Completa tu ficha técnica para nuestra base de datos.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                            value={profile.firstName}
                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                            className={errors.firstName ? "border-destructive" : ""}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Apellidos</Label>
                        <Input
                            value={profile.lastName}
                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                            className={errors.lastName ? "border-destructive" : ""}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profile.email} disabled className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className={errors.phone ? "border-destructive" : ""}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Altura (cm)</Label>
                        <Input
                            value={profile.height}
                            onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                            placeholder="175"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Color Ojos</Label>
                        <Input
                            value={profile.eyeColor}
                            onChange={(e) => setProfile({ ...profile, eyeColor: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Color Pelo</Label>
                        <Input
                            value={profile.hairColor}
                            onChange={(e) => setProfile({ ...profile, hairColor: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Etnia</Label>
                        <Select onValueChange={(val) => setProfile({ ...profile, ethnicity: val })}>
                            <SelectTrigger className={errors.ethnicity ? "border-destructive" : ""}>
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                {ETHNICITIES.map(e => (
                                    <SelectItem key={e} value={e}>{e}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Idiomas</Label>
                    <Input
                        value={profile.languages}
                        onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                        placeholder="Español, Inglés, Francés..."
                    />
                </div>

                <div className="space-y-2">
                    <Label>Experiencia / CV (Resumen)</Label>
                    <Textarea
                        value={profile.experience}
                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                        placeholder="Breve resumen de tu experiencia o formación..."
                        className="h-24"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Fotos (Book) <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional)</span></Label>
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'photos')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {profile.photos.length > 0
                                    ? `${profile.photos.length} fotos seleccionadas`
                                    : "Arrastra o haz clic para subir fotos"}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Videobook (Archivo) <span className="text-muted-foreground text-xs font-normal ml-1">(Opcional, Max 100MB)</span></Label>
                            <div className={cn(
                                "border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative",
                                errors.video ? "border-destructive/50 bg-destructive/10" : ""
                            )}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleFileChange(e, 'video')}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    {profile.video
                                        ? profile.video.name
                                        : "Sube tu videobook"}
                                </p>
                            </div>
                            {errors.video && <p className="text-xs text-destructive">{errors.video}</p>}
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">O ENLACE</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <div className="space-y-2">
                            <Label>Enlace a Videobook / Web <span className="text-muted-foreground text-xs font-normal ml-1">(YouTube, Vimeo, Web)</span></Label>
                            <Input
                                value={profile.videoUrl || ""}
                                onChange={(e) => setProfile({ ...profile, videoUrl: e.target.value })}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 text-lg font-bold bg-primary text-black hover:bg-primary/90"
                    disabled={isUploading}
                >
                    {isUploading ? "Guardando Perfil..." : "Guardar Perfil"}
                </Button>
            </form>
        </div>
    );
}
