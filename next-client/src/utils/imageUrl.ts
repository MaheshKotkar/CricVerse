export const getImageUrl = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) {
        return path;
    }
    // Remove leading slash if it exists to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `http://localhost:5000/${cleanPath}`;
};
