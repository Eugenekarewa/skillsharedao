import { AuthClient } from "@dfinity/auth-client";

// Internet Identity Provider URL for Skillshare DAO
const IDENTITY_PROVIDER = `http://${process.env.IDENTITY_CANISTER_ID}.${window.location.hostname}:4943`;
const MAX_TTL = 7 * 24 * 60 * 60 * 1000 * 1000 * 1000; // Maximum Time-to-Live (7 days)

// Helper function to initialize AuthClient
export async function getAuthClient() {
    try {
        return await AuthClient.create();
    } catch (error) {
        console.error("Failed to initialize AuthClient:", error);
        throw error;
    }
}

// Fetch the authenticated user's Principal
export async function getPrincipal() {
    try {
        const authClient = await getAuthClient();
        return authClient.getIdentity()?.getPrincipal();
    } catch (error) {
        console.error("Error fetching Principal:", error);
        throw error;
    }
}

// Get the Principal as a string
export async function getPrincipalText() {
    try {
        const principal = await getPrincipal();
        return principal ? principal.toText() : null;
    } catch (error) {
        console.error("Error converting Principal to text:", error);
        throw error;
    }
}

// Check if the user is authenticated
export async function isAuthenticated() {
    try {
        const authClient = await getAuthClient();
        return await authClient.isAuthenticated();
    } catch (error) {
        console.warn("Error checking authentication status. Logging out.", error);
        await logout();
        return false;
    }
}

// Perform login with Internet Identity
export async function login() {
    try {
        const authClient = await getAuthClient();
        const isAuthenticated = await authClient.isAuthenticated();

        if (!isAuthenticated) {
            await authClient.login({
                identityProvider: IDENTITY_PROVIDER,
                onSuccess: async () => {
                    console.log("Login successful.");
                    window.location.reload();
                },
                maxTimeToLive: MAX_TTL,
            });
        }
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}

// Logout the user
export async function logout() {
    try {
        const authClient = await getAuthClient();
        await authClient.logout();
        console.log("User logged out.");
        window.location.reload();
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
}
