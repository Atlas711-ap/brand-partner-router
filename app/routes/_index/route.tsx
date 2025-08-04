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
    socialX: formData.get("socialX") || "",
    socialFacebook: formData.get("socialFacebook") || "",
    socialInstagram: formData.get("socialInstagram") || "",
    socialTiktok: formData.get("socialTiktok") || "",
    socialYoutube: formData.get("socialYoutube") || "",
    timestamp: new Date().toISOString()
  };

  console.log("BRAND DATA TO SEND:", brandData);

  // Send to Google Sheets
  try {
    console.log("ATTEMPTING FETCH TO GOOGLE SHEETS");
    const response = await fetch('https://script.google.com/macros/s/AKfycbxv_FJSWnwJ4cPFAgfnTHCmpExp8Me5qqmKAesKbYnGEDSdNyW-hA_qLrI2LIQAv8INfA/exec', {
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

            <div className={styles.shopifySection}>
              <h3 className={styles.sectionTitle}>🛍️ Shopify Store Integration</h3>
              <p className={styles.sectionSubtitle}>Already selling on Shopify? Connect your store for instant product sync!</p>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="hasShopifyStore" 
                    onChange={(e) => setHasShopifyStore(e.target.checked)}
                  />
                  <span className={styles.checkboxText}>✅ Yes, I have a Shopify store</span>
                </label>
              </div>

              {hasShopifyStore && (
                <div className={styles.shopifyFields}>
                  <div className={styles.trustBadge}>
                    <p>🔒 <strong>Your data is secure:</strong> We only access product information (title, description, price) to sync with ATLAS. No customer data, orders, or payments are accessed.</p>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Shopify Store Domain</label>
                    <input 
                      className={styles.formInput} 
                      type="text" 
                      name="shopifyDomain" 
                      required={hasShopifyStore}
                      placeholder="your-store.myshopify.com"
                    />
                    <small>Enter your full Shopify domain (e.g., mybrand.myshopify.com)</small>
                  </div>

                  <div className={styles.instructionsBox}>
                    <h4>📋 How to get your Shopify API Key (2 minutes):</h4>
                    <div className={styles.stepsList}>
                      <div className={styles.step}>
                        <span className={styles.stepNumber}>1</span>
                        <span>Go to your Shopify Admin → <strong>Settings</strong></span>
                      </div>
                      <div className={styles.step}>
                        <span className={styles.stepNumber}>2</span>
                        <span>Click <strong>Apps and sales channels</strong></span>
                      </div>
                      <div className={styles.step}>
                        <span className={styles.stepNumber}>3</span>
                        <span>Click <strong>Develop apps</strong> → <strong>Create an app</strong></span>
                      </div>
                      <div className={styles.step}>
                        <span className={styles.stepNumber}>4</span>
                        <span>Name it "ATLAS Connector" → <strong>Create app</strong></span>
                      </div>
                      <div className={styles.step}>
                        <span className={styles.stepNumber}>5</span>
                        <span>Click <strong>Configure Admin API scopes</strong></span>
                      </div>
                      <div className={styles.step}>
                        <span className={styles.stepNumber}>6</span>
                        <span>Enable: <strong>read_products</strong> and <strong>read_inventory</strong></span>
                      </div>
                      <div className={styles.step}>
                        <span className={styles.stepNumber}>7</span>
                        <span>Click <strong>Save</strong> → <strong>Install app</strong></span>
                      </div>
                      <div className={styles.step}>
                        <span className={styles.stepNumber}>8</span>
                        <span>Copy the <strong>Admin API access token</strong> and paste below</span>
                      </div>
                    </div>
                  </div>

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

                  <div className={styles.benefitsBox}>
                    <h4>✨ Benefits of connecting your Shopify store:</h4>
                    <ul>
                      <li>🚀 Instant product sync - no manual uploads</li>
                      <li>📊 Real-time inventory updates</li>
                      <li>💰 Automatic price synchronization</li>
                      <li>🎯 Reach ATLAS's growing customer base</li>
                    </ul>
                  </div>
                </div>
              )}
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
              🚀 Launch My Brand on ATLAS
            </button>

            <div className={styles.trustIndicators}>
              <p>🛡️ Trusted by 100+ brands • 🔒 Bank-level security • ⚡ 2-minute setup</p>
            </div>
          </Form>
        </div>

        <div className={styles.atlasFooter}>
          <strong>ATLAS</strong> - The Future of Commerce
        </div>
      </div>
    </div>
  );
}
