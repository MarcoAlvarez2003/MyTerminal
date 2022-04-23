async function exist(path: string) {
    try {
        await Deno.stat(path);

        return true;
    } catch {
        return false;
    }
}

export { exist };
