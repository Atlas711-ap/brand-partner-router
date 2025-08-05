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
  const shippingRegions = formData.getAll("shippingRegions[]");
  const onlyOtherSelected =
    shippingRegions.length === 1 && shippingRegions[0] === "Other regions (not currently supported)";

  if (onlyOtherSelected) {
    return json({ success: false, message: "We're currently only onboarding brands that ship to U.S. and Europe. Join our waitlist for future expansion!" });
  }

  const brandData = {
    brandName: formData.get("brandName"),
    email: formData.get("email"),
    productTier: formData.get("productTier"),
    category: formData.get("category"),
    hasShopifyStore: formData.get("hasShopifyStore") === "on",
    shopifyDomain: formData.get("shopifyDomain") || "",
    apiToken: formData.get("apiToken") || "",
    shippingRegions: shippingRegions,
    socialX: formData.get("socialX") || "",
    socialFacebook: formData.get("socialFacebook") || "",
    socialInstagram: formData.get("socialInstagram") || "",
    socialTiktok: formData.get("socialTiktok") || "",
    socialYoutube: formData.get("socialYoutube") || "",
    timestamp: new Date().toISOString()
  };

  console.log("BRAND DATA TO SEND:", brandData);

  try {
    console.log("ATTEMPTING FETCH TO GOOGLE SHEETS");
    const response = await fetch('https://script.google.com/macros/s/AKfycbzB87iIXRvuSp0b_9GQtcAfaHMgz2cfW1zCcZ9kMtL6JSyqOt5K6yWxE_mKvBFQd57ymg/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brandData)
    });
    console.log("FETCH RESPONSE:", response.status);
  } catch (error) {
    console.error('Error sending to Google Sheets:', error);
  }

  return json({ success: true, message: "Welcome to ATLAS! We'll review your application and be in touch within 24 hours." });
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [hasShopifyStore, setHasShopifyStore] = useState(false);
  const [showWaitlistMessage, setShowWaitlistMessage] = useState(false);

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
            {/* ...existing fields... */}

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="shippingRegions">Which regions does your Shopify store currently ship to? *</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="shippingRegions[]"
                    value="United States"
                    onChange={() => setShowWaitlistMessage(false)}
                  />
                  <span className={styles.checkboxText}>United States</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="shippingRegions[]"
                    value="Europe"
                    onChange={() => setShowWaitlistMessage(false)}
                  />
                  <span className={styles.checkboxText}>Europe</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="shippingRegions[]"
                    value="Other regions (not currently supported)"
                    onChange={(e) => setShowWaitlistMessage(e.target.checked)}
                  />
                  <span className={styles.checkboxText}>Other regions (not currently supported)</span>
                </label>
              </div>
              {showWaitlistMessage && (
                <div className={styles.waitlistMessage}>
                  <p>
                    We're currently only onboarding brands that ship to U.S. and Europe. Join our waitlist for
                    future expansion!
                  </p>
                </div>
              )}
            </div>

            {/* ...submit button and footer... */}
          </Form>
        </div>

        <div className={styles.atlasFooter}>
          <strong>ATLAS</strong> - The Future of Commerce
        </div>
      </div>
    </div>
  );
}
