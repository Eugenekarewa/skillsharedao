import { logout } from "./auth";

class IcHttp {
    #agent;
    #decoder;
    #encoder;

    constructor(agent) {
        this.#agent = agent;
        this.#decoder = new TextDecoder("utf-8");
        this.#encoder = new TextEncoder();
    }

    /**
     * Perform a GET request.
     * @param {Object} req - Request details with `path` and optional `params`.
     * @returns {Promise<any>} Response from the GET request.
     */
    async GET(req) {
        return await this.#doRequest(req.path, "GET", req.params);
    }

    /**
     * Perform a POST request.
     * @param {Object} req - Request details with `path`, optional `params`, and `data`.
     * @returns {Promise<any>} Response from the POST request.
     */
    async POST(req) {
        return await this.#doRequest(req.path, "POST", req.params, req.data);
    }

    /**
     * Perform the actual HTTP request.
     * @param {string} path - API endpoint path.
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
     * @param {Object} [params] - Query parameters.
     * @param {Object} [data] - Request payload for POST/PUT.
     * @returns {Promise<any>} Parsed response.
     * @private
     */
    async #doRequest(path, method, params = {}, data = {}) {
        try {
            const queryParams = new URLSearchParams(params);
            const url = queryParams.toString() ? `${path}?${queryParams}` : path;

            let response;

            switch (method) {
                case "GET":
                    response = await this.#agent.http_request({
                        url,
                        method,
                        body: [],
                        headers: [],
                        certificate_version: [],
                    });
                    break;

                case "POST":
                case "PUT":
                case "DELETE":
                    const body = data ? this.#encoder.encode(JSON.stringify(data)) : [];
                    response = await this.#agent.http_request_update({
                        url,
                        method,
                        body,
                        headers: [
                            ["Content-Type", "application/json; charset=utf-8"],
                            ["Content-Length", `${body.length}`],
                        ],
                        certificate_version: [],
                    });
                    break;

                default:
                    throw new Error(`Unsupported HTTP method: ${method}`);
            }

            return this.#parseResponse(response);

        } catch (err) {
            console.error("HTTP request failed:", err);

            // Handle authentication errors
            if (err.name === "AgentHTTPResponseError") {
                logout();
            }

            throw new Error(`Request failed for path: ${path}`);
        }
    }

    /**
     * Parses the HTTP response.
     * @param {Object} response - Raw HTTP response.
     * @returns {any} Parsed response data.
     * @private
     */
    #parseResponse(response) {
        try {
            const body = this.#decoder.decode(response.body);

            if (response.status_code !== 200) {
                throw new Error(`Error: ${body} (Status Code: ${response.status_code})`);
            }

            const contentTypeHeader = response.headers.find(
                ([headerName]) => headerName.toLowerCase() === "content-type"
            );

            if (contentTypeHeader && contentTypeHeader[1].toLowerCase() === "application/json; charset=utf-8") {
                return JSON.parse(body);
            }

            return body;

        } catch (err) {
            console.error("Error parsing response:", err);
            throw new Error("Failed to parse the server response.");
        }
    }
}

export default IcHttp;
