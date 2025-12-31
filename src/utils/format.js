// Format TOMAN prices in a consistent way
export function formatPrice(value) {
    if (value == null) {
        return "-";
    }

    const num = Number(value);
    if (Number.isNaN(num)) {
        return "-";
    }

    return num.toLocaleString("fa-IR");
}
