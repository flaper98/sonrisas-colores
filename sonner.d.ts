// sonner.d.ts

// Esta declaración crea un "tipo falso" para el módulo 'sonner'
// que le dice a TypeScript que existe una exportación llamada 'toast'.

declare module 'sonner' {
    export const toast: any; // Declara explícitamente la exportación 'toast'
    // Si usas el componente Toaster:
    // export const Toaster: any;
}