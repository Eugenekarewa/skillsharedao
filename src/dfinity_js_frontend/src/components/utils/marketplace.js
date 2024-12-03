import { approve } from "./icrc2_ledger";
import { createCanisterActor } from "./canisterFactory";
import { idlFactory as marketPlaceIDL } from "../../../declarations/dfinity_js_backend/dfinity_js_backend.did.js";
import IcHttp from "./ichttp";

let httpClient;

(async function initializeHttpClient() {
    const marketplaceAgentCanister = await createCanisterActor(
        process.env.BACKEND_CANISTER_ID,
        marketPlaceIDL
    );
    httpClient = new IcHttp(marketplaceAgentCanister);
})();

/**
 * Creates a new product in the marketplace.
 * @param {Object} data - The product data including title, description, price, etc.
 * @returns {Promise<any>} API response for product creation.
 */
export async function createProduct(data) {
    try {
        return await httpClient.POST({ path: "/products", data });
    } catch (err) {
        console.error("Error creating product:", err);
        throw new Error("Failed to create product.");
    }
}

/**
 * Gets the address associated with a principal's hexadecimal representation.
 * @param {string} principalHex - The hexadecimal representation of the principal.
 * @returns {Promise<string>} The associated address.
 */
export async function getAddressFromPrincipal(principalHex) {
    try {
        return await httpClient.GET({ path: `/principal-to-address/${principalHex}` });
    } catch (err) {
        console.error("Error fetching address from principal:", err);
        throw new Error("Failed to fetch address from principal.");
    }
}

/**
 * Fetches all products from the marketplace.
 * @returns {Promise<Array>} A list of products.
 */
export async function getProducts() {
    try {
        return await httpClient.GET({ path: "/products" });
    } catch (err) {
        console.error("Error fetching products:", err);
        throw new Error("Failed to fetch products.");
    }
}

/**
 * Buys a product by approving and creating an order.
 * @param {Object} product - The product object with `id` and `price`.
 * @returns {Promise<any>} API response for buying a product.
 */
export async function buyProduct(product) {
    try {
        const { id, price } = product;
        
        // Approve transaction for the backend canister
        await approve(process.env.BACKEND_CANISTER_ID, price);
        
        // Place an order for the product
        return await httpClient.POST({
            path: "/orders",
            data: { productId: id },
        });
    } catch (err) {
        console.error("Error buying product:", err);
        throw new Error("Failed to buy product.");
    }
}
