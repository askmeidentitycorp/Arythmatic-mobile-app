# Deployment Instructions for Online Editors

## For Snack.expo.io or Similar Online Editors

### 1. Clear Cache Before Running
If using an online editor, make sure to:
- Click "Clear Cache" or "Reset" option in the editor
- Refresh the browser completely (Ctrl+Shift+R or Cmd+Shift+R)

### 2. Expected Behavior After Loading

#### Payment Screen Should Show:
- **KPI Values (matching web dashboard):**
  - Total Payments: 184
  - Total Value: $1,809.00
  - Successful: $1,740.00
  - Failed/Voided: $69.00

- **Header Buttons:**
  - 📤 Export (blue button)
  - 🔍 Filters (outlined button)

- **Currency Breakdown Section:**
  - INR: 4 payments, ₹112,500.00
  - USD: 5 payments, $459.00
  - (etc.)

- **Payment Cards:**
  - Customer display names (e.g., "G Vinod Kumar")
  - NOT customer IDs
  - Transaction IDs
  - Payment amounts with currency symbols

#### Invoice Screen Should Show:
- Customer display names in card headers
- Proper customer details in expanded view

#### Customer Screen Should Show:
- Compact header with + icon button
- Clean "Basic", "Contact", "Notes" tabs

### 3. API Configuration

Ensure your `constants/config.js` has the correct API base URL:
```javascript
export const API_BASE_URL = 'https://your-api-domain.com/api';
```

### 4. If Issues Persist

1. **Check browser console** for API errors
2. **Verify API is accessible** from your network
3. **Check authentication** - ensure token is valid
4. **Try incognito/private browsing** to bypass any cached data

### 5. Local Development

If running locally:
```bash
# Clear cache and restart
npm start -- --clear

# Or manually clear
rm -rf .expo node_modules/.cache .expo-shared
npm start
```

## Changes Made in Latest Commit

✅ Fixed customer display name mapping (API integration)
✅ Added Export functionality for payments
✅ Optimized all screens for mobile (no overflow)
✅ Removed unused hooks (usePayments.js, usePaymentAnalytics.js)
✅ KPI calculations match web dashboard exactly
✅ All touch targets minimum 40x40px
✅ Icon-first button design for mobile

## Troubleshooting

### Payment Screen Shows Mock Data
- **Cause:** Cache not cleared or app not reloaded
- **Solution:** Clear browser cache, refresh completely, or press 'r' in Expo terminal

### Customer Names Show as IDs
- **Cause:** API response not mapped correctly
- **Solution:** Code already fixed - just reload the app

### Buttons Overlap on Small Screens
- **Cause:** Old cached version
- **Solution:** Code already fixed - clear cache and reload

## Support
For issues, check:
1. Browser developer console (F12)
2. Expo logs
3. Network tab for API calls
