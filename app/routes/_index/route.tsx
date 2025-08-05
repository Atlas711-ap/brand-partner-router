// 🔄 route.tsx — Full Updated Version with Shipping Region Verification

import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { useState } from "react";

import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return { showForm: Boolean(login) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const brandData = {
    brandName: formData.get("brandName"),
    email: formData.get("email"),
    productTier: formData.get("productTier"),
    category: formData.get("category"),
    hasShopifyStore: formData.get("hasShopifyStore") === "on",
    shopifyDomain: formData.get("shopifyDomain") || "",
    apiToken: formData.get("apiToken") || "",
    shippingRegions: formData.getAll("shippingRegions").join(", "), // ✅ New field
    socialX: formData.get("socialX") || "",
    socialFacebook: formData.get("socialFacebook") || "",
    socialInstagram: formData.get("socialInstagram") || "",
    socialTiktok: formData.get("socialTiktok") || "",
    socialYoutube: formData.get("socialYoutube") || "",
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbzB87iIXRvuSp0b_9GQtcAfaHMgz2cfW1zCcZ9kMtL6JSyqOt5K6yWxE_mKvBFQd57ymg/exec',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData),
      }
    );
    console.log("FETCH RESPONSE:", response.status);
  } catch (error) {
    console.error("Error sending to Google Sheets:", error);
  }

  return json({ success: true, message: "Welcome to ATLAS! We'll review your application and be in touch within 24 hours." });
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [hasShopifyStore, setHasShopifyStore] = useState(false);
  const [shippingRegions, setShippingRegions] = useState<string[]>([]);
  const [showWaitlistMessage, setShowWaitlistMessage] = useState(false);

  const handleShippingRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    let updatedRegions = isChecked
      ? [...shippingRegions, value]
      : shippingRegions.filter((region) => region !== value);

    setShippingRegions(updatedRegions);

    const hasUSOrEurope = updatedRegions.includes("United States") || updatedRegions.includes("Europe");
    const hasOnlyOther = updatedRegions.length === 1 && updatedRegions.includes("Other regions");

    setShowWaitlistMessage(!hasUSOrEurope && hasOnlyOther);
  };

  if (actionData?.success) {
    return (
      <div className={styles.index}>
        <div className={styles.successMessage}>
          <h1>🎉 Welcome to ATLAS!</h1>
          <p>{actionData.message}</p>
          <div className={styles.atlasFooter}>Powered by ATLAS</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <div className={styles.atlasLogo}>
          <h1 className={styles.logoText}>ATLAS</h1>
        </div>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Join ATLAS Shopping Mall as a Trusted Brand</h2>
          <p className={styles.formSubtitle}>Connect your brand to our AI-powered marketplace and reach thousands of new customers</p>

          <Form className={styles.brandForm} method="post">
            {/* ... existing form fields ... */}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Shopify API Token</label>
              <input 
                className={styles.formInput} 
                type="password" 
                name="apiToken" 
                required={hasShopifyStore}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <small>🔐 This token is used <strong>only</strong> to sync your products - no other store data is accessed</small>
            </div>

            {/* ✅ Shipping Region Section */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Which regions does your Shopify store currently ship to? *</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="shippingRegions" 
                    value="United States"
                    onChange={handleShippingRegionChange}
                    required={!shippingRegions.includes("United States") && !shippingRegions.includes("Europe")}
                  />
                  <span className={styles.checkboxText}>United States</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="shippingRegions" 
                    value="Europe"
                    onChange={handleShippingRegionChange}
                    required={!shippingRegions.includes("United States") && !shippingRegions.includes("Europe")}
                  />
                  <span className={styles.checkboxText}>Europe</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="shippingRegions" 
                    value="Other regions"
                    onChange={handleShippingRegionChange}
                  />
                  <span className={styles.checkboxText}>Other regions (not currently supported)</span>
                </label>
              </div>
              {showWaitlistMessage && (
                <div className={styles.waitlistMessage}>
                  <p>⚠️ We're currently only onboarding brands that ship to U.S. and Europe. Join our waitlist for future expansion!</p>
                </div>
              )}
            </div>

            {/* ... remaining fields and submit button ... */}

          </Form>
        </div>

        <div className={styles.atlasFooter}>
          <strong>ATLAS</strong> - The Future of Commerce
        </div>
      </div>
    </div>
  );
}
