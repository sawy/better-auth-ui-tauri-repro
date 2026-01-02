/**
 * Minimal reproduction: @daveyplate/better-auth-ui crashes in Tauri
 * 
 * BUG: When importing @daveyplate/better-auth-ui in a Tauri app,
 * the app crashes with:
 *   BetterAuthError: Invalid base URL: tauri://localhost. URL must include 'http://' or 'https://'
 * 
 * ROOT CAUSE:
 * 1. @daveyplate/better-auth-ui creates an internal authClient at module load time
 *    in src/types/auth-client.ts without a baseURL
 * 2. better-auth's getBaseURL() falls back to window.location.origin
 * 3. In Tauri production builds, window.location.origin is "tauri://localhost"
 * 4. better-auth throws because tauri:// is not http:// or https://
 * 
 * This happens at MODULE LOAD TIME, before any React component renders,
 * so it crashes even if you never use the internal authClient.
 */

// Simply importing this package causes the crash in Tauri
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { createAuthClient } from "better-auth/react";

// Even though we create our own authClient with a proper baseURL...
const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // This is correct!
});

// ...the crash happens BEFORE this code runs because @daveyplate/better-auth-ui
// creates its own internal authClient without baseURL at import time

export default function App() {
  return (
    <AuthUIProvider authClient={authClient}>
      <div>
        <h1>If you see this, the bug is fixed!</h1>
        <p>
          In Tauri production builds, this page would crash with:
          <br />
          <code>
            BetterAuthError: Invalid base URL: tauri://localhost
          </code>
        </p>
      </div>
    </AuthUIProvider>
  );
}
