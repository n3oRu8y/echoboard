(() => {
    const token = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!token) return;

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        const requestMethod = input instanceof Request ? input.method : "GET";
        const method = (init.method ?? requestMethod).toUpperCase();
        if (["GET", "HEAD", "OPTIONS"].includes(method)) {
            return originalFetch(input, init);
        }

        const requestUrl = input instanceof Request ? input.url : input.toString();
        const url = new URL(requestUrl, window.location.href);
        if (url.origin !== window.location.origin) {
            return originalFetch(input, init);
        }

        const requestHeaders = input instanceof Request ? input.headers : undefined;
        const headers = new Headers(init.headers ?? requestHeaders);
        headers.set("X-CSRF-Token", token);

        return originalFetch(input, { ...init, headers });
    };
})();
