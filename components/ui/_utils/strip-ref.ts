export function stripRef<T extends object>(props: T): Omit<T, 'ref'> {
    const { ref, ...rest } = props as any;
    return rest;
}
