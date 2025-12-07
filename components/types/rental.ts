export interface Rental {
    id: number
    num_children: number
    duration_minutes: number
    start_time: string
    end_time: string
    total_price: number
    discount_applied: boolean
    discount_amount: number
    status: string
    product_name?: string
    created_at?: string
    client_name:string
    client_dni:string
    notes:string
    payment_method: string
}
