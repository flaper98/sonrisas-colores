// Corrección global para errores de refs en componentes polimórficos
declare module "react" {
    interface RefAttributes<T> {
        ref?: any;
    }
}
