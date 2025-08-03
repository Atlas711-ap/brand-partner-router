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
    socialX: formData.get("socialX"),
    socialFacebook: formData.get("socialFacebook"),
    socialInstagram: formData.get("socialInstagram"),
    socialTiktok: formData.get("socialTiktok"),
    socialYoutube: formData.get("socialYoutube"),
    timestamp: new Date().toISOString()
  };

  // Send to Google Sheets
  try {
    await fetch('https://script.google.com/macros/s/AKfycbxv_FJSWnwJ4cPFAgfnTHCmpExpBMe5qqmKAesKbYnGEDSdNyW-hA_qLr2LIQaV8INfA/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brandData)
    });
  } catch (error) {
    console.error('Error sending to Google Sheets:', error);
  }
  
  return json({ success: true, message: "Thank you! We'll be in touch soon." });
};


export default function App() {
  const { showForm } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [step, setStep] = useState(1);

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
          <h2 className={styles.formTitle}>Join the Future of Commerce</h2>
          <p className={styles.formSubtitle}>Connect your brand to our AI-powered marketplace</p>
          
          <Form className={styles.brandForm} method="post">
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Brand Name</label>
              <input 
                className={styles.formInput} 
                type="text" 
                name="brandName" 
                required 
                placeholder="Enter your brand name"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <input 
                className={styles.formInput} 
                type="email" 
                name="email" 
                required 
                placeholder="your@email.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>How many products would you like to sync?</label>
              <select className={styles.formSelect} name="productTier" required>
                <option value="">Select range</option>
                <option value="1-5">1-5 products</option>
                <option value="5-20">5-20 products</option>
                <option value="20+">20+ products</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select className={styles.formSelect} name="category" required>
                <option value="">Select category</option>
                <option value="Fashion">Fashion</option>
                <option value="Beauty">Beauty</option>
                <option value="Electronics">Electronics</option>
                <option value="Home">Home & Living</option>
                <option value="Sports">Sports & Fitness</option>
                <option value="Food">Food & Beverage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Social Media (Optional)</label>
              <div className={styles.socialInputs}>
                <input className={styles.socialInput} type="url" name="socialX" placeholder="X (Twitter)" />
                <input className={styles.socialInput} type="url" name="socialFacebook" placeholder="Facebook" />
                <input className={styles.socialInput} type="url" name="socialInstagram" placeholder="Instagram" />
                <input className={styles.socialInput} type="url" name="socialTiktok" placeholder="TikTok" />
                <input className={styles.socialInput} type="url" name="socialYoutube" placeholder="YouTube" />
              </div>
            </div>

            <button className={styles.submitButton} type="submit">
              Join ATLAS Marketplace
            </button>
          </Form>
        </div>

        {showForm && (
          <div className={styles.installSection}>
            <h3>Already a partner? Install our app:</h3>
            <Form className={styles.installForm} method="post" action="/auth/login">
              <input className={styles.shopInput} type="text" name="shop" placeholder="your-store.myshopify.com" />
              <button className={styles.installButton} type="submit">Install App</button>
            </Form>
          </div>
        )}

        <div className={styles.atlasFooter}>
          <strong>ATLAS</strong>
        </div>
      </div>
    </div>
  );
}
