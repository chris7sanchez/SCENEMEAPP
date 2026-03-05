import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Square, Play, Trash2, StickyNote, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChartNote {
    id: string;
    type: 'text' | 'audio';
    content: string;
    audioUrl?: string;
    color: string;
    position: { x: number; y: number };
    isPinned: boolean;
    timestamp: Date;
    planetTag?: string;
}

interface ChartNotesSystemProps {
    chartId: string;
    onNotesChange?: (notes: ChartNote[]) => void;
}

const NOTE_COLORS = [
    { name: 'Yellow', value: '#FFF9C4', border: '#F9A825' },
    { name: 'Pink', value: '#FCE4EC', border: '#E91E63' },
    { name: 'Blue', value: '#E3F2FD', border: '#2196F3' },
    { name: 'Green', value: '#E8F5E9', border: '#4CAF50' },
    { name: 'Purple', value: '#F3E5F5', border: '#9C27B0' },
];

const PLANET_TAGS = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón'];

const ChartNotesSystem: React.FC<ChartNotesSystemProps> = ({ chartId, onNotesChange }) => {
    const [notes, setNotes] = useState<ChartNote[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteColor, setNewNoteColor] = useState(NOTE_COLORS[0]);
    const [selectedPlanet, setSelectedPlanet] = useState<string>('');
    const [isRecording, setIsRecording] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const createTextNote = () => {
        if (!newNoteContent.trim()) return;

        const newNote: ChartNote = {
            id: `note-${Date.now()}`,
            type: 'text',
            content: newNoteContent,
            color: newNoteColor.value,
            position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
            isPinned: false,
            timestamp: new Date(),
            planetTag: selectedPlanet || undefined
        };

        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        onNotesChange?.(updatedNotes);

        setNewNoteContent('');
        setSelectedPlanet('');
        setIsCreating(false);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);

                const newNote: ChartNote = {
                    id: `note-${Date.now()}`,
                    type: 'audio',
                    content: 'Nota de audio',
                    audioUrl,
                    color: NOTE_COLORS[2].value,
                    position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
                    isPinned: false,
                    timestamp: new Date(),
                    planetTag: selectedPlanet || undefined
                };

                const updatedNotes = [...notes, newNote];
                setNotes(updatedNotes);
                onNotesChange?.(updatedNotes);
                setSelectedPlanet('');
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('No se pudo acceder al micrófono. Verifica los permisos.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const deleteNote = (id: string) => {
        const updatedNotes = notes.filter(n => n.id !== id);
        setNotes(updatedNotes);
        onNotesChange?.(updatedNotes);
    };

    const togglePin = (id: string) => {
        const updatedNotes = notes.map(n =>
            n.id === id ? { ...n, isPinned: !n.isPinned } : n
        );
        setNotes(updatedNotes);
        onNotesChange?.(updatedNotes);
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {/* Floating Notes */}
            <AnimatePresence>
                {notes.map(note => (
                    <motion.div
                        key={note.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        drag
                        dragMomentum={false}
                        className="absolute pointer-events-auto"
                        style={{
                            left: note.position.x,
                            top: note.position.y,
                        }}
                    >
                        <div
                            className={cn(
                                "w-64 p-4 rounded-2xl shadow-2xl backdrop-blur-sm relative group cursor-move",
                                note.isPinned && "ring-2 ring-amber-500"
                            )}
                            style={{
                                backgroundColor: note.color,
                                borderLeft: `4px solid ${NOTE_COLORS.find(c => c.value === note.color)?.border || '#000'}`
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {note.type === 'audio' ? <Mic size={12} /> : <StickyNote size={12} />}
                                    <span className="text-[8px] uppercase font-black tracking-wider opacity-60">
                                        {note.planetTag || 'General'}
                                    </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => togglePin(note.id)}
                                        className={cn(
                                            "p-1 rounded hover:bg-black/10 transition-colors",
                                            note.isPinned && "text-amber-600"
                                        )}
                                    >
                                        <Pin size={12} />
                                    </button>
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="p-1 rounded hover:bg-red-500/20 text-red-600 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            {note.type === 'text' ? (
                                <p className="text-sm leading-relaxed font-serif">{note.content}</p>
                            ) : (
                                <audio controls src={note.audioUrl} className="w-full mt-2" style={{ height: '32px' }} />
                            )}

                            {/* Footer */}
                            <div className="mt-3 pt-2 border-t border-black/10 text-[9px] text-black/50 font-mono">
                                {note.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Create Note Button */}
            <motion.button
                onClick={() => setIsCreating(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-48 right-6 z-[99] w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-2xl pointer-events-auto hover:bg-amber-600 transition-colors"
            >
                <StickyNote size={20} />
            </motion.button>

            {/* Create Note Panel */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] pointer-events-auto"
                        onClick={() => setIsCreating(false)}
                    >
                        <motion.div
                            initial={{ y: 50 }}
                            animate={{ y: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black">Nueva Nota</h3>
                                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Planet Tag Selector */}
                            <div className="mb-4">
                                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500 block mb-2">
                                    Etiquetar Planeta (Opcional)
                                </label>
                                <select
                                    value={selectedPlanet}
                                    onChange={(e) => setSelectedPlanet(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
                                >
                                    <option value="">Sin etiqueta</option>
                                    {PLANET_TAGS.map(planet => (
                                        <option key={planet} value={planet}>{planet}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Color Picker */}
                            <div className="mb-4">
                                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500 block mb-2">
                                    Color
                                </label>
                                <div className="flex gap-2">
                                    {NOTE_COLORS.map(color => (
                                        <button
                                            key={color.name}
                                            onClick={() => setNewNoteColor(color)}
                                            className={cn(
                                                "w-10 h-10 rounded-xl transition-all",
                                                newNoteColor.name === color.name && "ring-2 ring-offset-2 ring-black"
                                            )}
                                            style={{ backgroundColor: color.value, border: `2px solid ${color.border}` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Text Input */}
                            <textarea
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                placeholder="Escribe tu nota aquí..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-serif resize-none h-32 mb-4"
                            />

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={createTextNote}
                                    disabled={!newNoteContent.trim()}
                                    className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Crear Nota
                                </button>
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={cn(
                                        "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2",
                                        isRecording
                                            ? "bg-red-500 text-white hover:bg-red-600"
                                            : "bg-indigo-500 text-white hover:bg-indigo-600"
                                    )}
                                >
                                    {isRecording ? (
                                        <>
                                            <Square size={14} />
                                            Stop
                                        </>
                                    ) : (
                                        <>
                                            <Mic size={14} />
                                            Audio
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChartNotesSystem;
