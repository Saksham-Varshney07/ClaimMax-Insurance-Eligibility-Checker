export function matchNames(billName: string, cardName: string): boolean {
    // simple string distances could reside here
    return billName.toLowerCase() === cardName.toLowerCase();
}
