"use client";

import { ReactNode } from "react";

interface ModalProps {
    show: boolean;
    title?: string;
    children: ReactNode;
    onClose: () => void;
}

export function Modal({ show, title, children, onClose }: ModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">

                {title && (
                    <h2 className="text-2xl font-bold text-center mb-4">
                        {title}
                    </h2>
                )}

                {/* Contenido centrado */}
                <div className="flex flex-col items-center text-center gap-4">
                    {children}
                </div>

            </div>
        </div>
    );
}
