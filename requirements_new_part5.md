# REQUIREMENT 5: CONSULTING SERVICE PRICING UPDATE (LIMITED TIME OFFER)

## 1. PRICING DISCOUNT FOR FINANCIAL CONSULTING
### Location
- Consulting Booking Page: `/book` (`src/app/book/page.tsx`).
- "Choose Consulting Service" screen (Step 1).

### Required Change
- For **Financial Consulting** (which originally costs `₹2,999`):
  - Change the display price to show a red **"Limited time offer"** badge.
  - Show the text **"-100% ₹0"** (with `-100%` in red and `₹0` in black/bold).
  - Below that, show **"Fees: ₹2,999"** with a strikethrough in gray.
  - The actual price charged during the booking and checkout process for Financial Consulting must be updated to **₹0** (free) to match the offer.

### Image Reference
- **Badge Style:** Red background (e.g., `#D31538` or `#E11D48`), rounded corners, white bold text.
- **Price Style:**
  - `-100%` in burgundy/red.
  - `₹0` in large bold black.
  - `Fees: ₹2,999` in strikethrough gray font.
