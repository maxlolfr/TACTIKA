(() => {
    const fetchResource = window.fetch.bind(window);
    const wasmUrl = new URL("index.wasm", document.baseURI);

    window.fetch = async (input, options) => {
        const url = new URL(input instanceof Request ? input.url : input, document.baseURI);
        if (url.href !== wasmUrl.href) {
            return fetchResource(input, options);
        }

        const response = await fetchResource(new URL("index.wasm.gz.bin", wasmUrl), options);
        if (!response.ok) {
            return response;
        }

        return new Response(response.body.pipeThrough(new DecompressionStream("gzip")), {
            headers: { "Content-Type": "application/wasm" },
        });
    };
})();
