import {Sale} from "@/components/sales/sales-page";

export interface SalesFormProps {
    onSubmit: (items: any[]) => Promise<void>;
    onCancel: () => void;
    defaultValues?: Sale;   // ← agregar esto
}
