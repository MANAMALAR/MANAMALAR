# Manamalar Mind Wellness Center

Website and appointment-booking system for Manamalar Mind Wellness Center, Villupuram, Tamil Nadu.

The frontend is a static website. Appointment data is stored in Google Sheets through a Google Apps Script Web App. Successful appointments can notify the clinic by email, Telegram, and WhatsApp.

## 1. Project Files

```text
index.html                  Main website markup and content
styles.css                  Layout, colors, responsive design, animations
script.js                   Navigation, booking validation, form submission
config.js                   Public frontend settings only
assets/                     Logo and website images
google-apps-script/Code.gs  Private booking backend
README.md                   This guide
```

The project has no build step. It can be opened locally or hosted on GitHub Pages.

## 2. Business Rules

The booking rules are enforced in both `script.js` and `google-apps-script/Code.gs`:

| Day | Appointment booking | Online session | Offline session |
|---|---|---|---|
| Monday-Saturday | Yes | Yes | Yes |
| Sunday | Yes | No | No |

Sunday is a valid booking date, but the clinic is closed. A Sunday booking is saved with `Clinic closed - no session` as its session status.

## 3. Contact Details Used by the Website

- WhatsApp only: `9487413221`
- Call only: `9940879221`
- Call only: `73059208791`
- Location: `# City Complex, Sudhakaran Nagar Main Road, opposite to Villupuram Court Road, Villupuram - 605602, Tamil Nadu`

Do not add the call-only numbers to WhatsApp links.

## 4. Create the Google Sheet

1. Create a new Google Sheet for appointments.
2. Copy the Sheet ID from its URL:

   ```text
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```

3. The backend creates the `Appointments` tab and headers automatically. If you create the headers manually, use this exact order:

   ```text
   Timestamp | Full Name | Phone Number | Age | Concern / Condition | Preferred Date | Session Type | Message
   ```

## 5. Configure Google Apps Script

1. Open the Google Sheet.
2. Select **Extensions -> Apps Script**.
3. Replace the starter code with the complete contents of `google-apps-script/Code.gs`.
4. Open **Project Settings -> Script Properties**.
5. Add these properties:

   | Property | What to enter |
   |---|---|
   | `ADMIN_EMAIL` | Email address that receives booking notifications |
   | `SHEET_ID` | Google Sheet ID from step 4 |
   | `SHEET_NAME` | `Appointments` |
   | `TELEGRAM_BOT_TOKEN` | Token from Telegram BotFather |
   | `TELEGRAM_CHAT_ID` | Telegram user or group chat ID |

6. Save the project.

### Create the Telegram bot

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and complete the prompts.
3. Copy the bot token into `TELEGRAM_BOT_TOKEN`.
4. Open the new bot and send it a message.
5. For a group notification, add the bot to the group and send a message in that group.
6. Open this URL, replacing `YOUR_BOT_TOKEN`:

   ```text
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```

7. Copy the relevant `message.chat.id` into `TELEGRAM_CHAT_ID`.

Never put the Telegram token or chat ID in `config.js`, HTML, JavaScript, or GitHub.

## 6. Deploy the Backend

1. In Apps Script, select **Deploy -> New deployment**.
2. Select **Web app** as the deployment type.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.
5. Click **Deploy** and authorize the requested permissions.
6. Copy the Web App URL ending in `/exec`.

When `Code.gs` changes later, use **Deploy -> Manage deployments -> Edit -> New version -> Deploy**. Do not create a new URL every time unless necessary.

## 7. Configure the Frontend

Open `config.js` and set `APPS_SCRIPT_URL` to the deployed Web App URL:

```js
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  WHATSAPP_NUMBER: "919487413221",
  CLINIC_PHONE_1: "9940879221",
  CLINIC_PHONE_2: "73059208791",
  CLINIC_NAME: "Manamalar Mind Wellness Center"
};
```

Only public values belong in `config.js`. Server-only values such as `ADMIN_EMAIL`, `SHEET_ID`, `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_CHAT_ID` belong in Apps Script Script Properties.

## 8. Test Locally

1. Open `index.html` in a browser.
2. Confirm the black logo intro finishes and the homepage becomes usable.
3. Check the booking form:
   - Select Monday: online and offline sessions are available.
   - Select Saturday: online and offline sessions are available.
   - Select Sunday: the date remains valid, the clinic-closed message appears, and sessions are disabled.
   - Change Sunday back to Monday: session selection becomes available again.
4. Confirm the `Send Us a Message` form is not present.
5. Check the page at mobile and desktop widths.
6. Confirm there is no horizontal scrolling, clipped text, or overlap with the sticky booking bar.

## 9. Test a Real Booking

Use a real test appointment only after the Apps Script URL is configured.

1. Submit a Monday-Saturday booking with a session type.
2. Confirm a row is added to the `Appointments` sheet.
3. Confirm the admin email arrives.
4. Confirm the Telegram notification arrives, if Telegram properties are configured.
5. Confirm the success message appears.
6. Confirm the WhatsApp confirmation link contains the appointment details.
7. Submit a Sunday booking without a session type.
8. Confirm it is saved with `Clinic closed - no session`.

The booking is saved before notifications are sent. Email and Telegram failures are isolated and do not invalidate a saved appointment.

## 10. Publish on GitHub Pages

1. Push the project to a GitHub repository.
2. Open the repository's **Settings -> Pages**.
3. Select the deployment branch, usually `main`.
4. Select the repository root as the folder.
5. Save and wait for GitHub Pages to publish.
6. Open the published URL and repeat the real booking test.

There is no npm install or build command for this static project.

## 11. Troubleshooting

### The booking says it is not configured

Check that `config.js` contains the current Apps Script `/exec` URL. Do not use the Apps Script editor URL.

### The booking does not appear in Sheets

Check `SHEET_ID`, `SHEET_NAME`, Apps Script authorization, and the Web App access setting. It must be deployed as **Anyone**.

### Email does not arrive

Check `ADMIN_EMAIL` in Script Properties. Email failure does not stop the Sheet save.

### Telegram does not arrive

Check the bot token and chat ID, send a message to the bot first, and deploy a new Apps Script version after code changes. Telegram failure does not stop the Sheet save.

### WhatsApp does not open automatically

The browser may block popups. Use the `Open WhatsApp to Confirm` button shown after a successful booking.

### The website shows old content

Hard-refresh the browser with `Ctrl+F5`. GitHub Pages and browsers can cache static files after deployment.

## 12. Security and Reliability

- Never commit Telegram tokens, private keys, email passwords, or other secrets.
- Keep Telegram credentials in Apps Script Script Properties only.
- Frontend validation improves user experience; backend validation is the security boundary.
- The backend serializes simultaneous Sheet writes with `LockService`.
- Notification failures are isolated from successful appointment storage.
- Google Apps Script and Google Sheets have quotas. Very high traffic may require a dedicated backend and database.
- After changing `Code.gs`, always deploy a new Web App version.

## 13. Updating Images and Logo

Replace the matching file in `assets/` without changing its filename. The current logo file is `assets/logo.jpeg`, used in the navbar, footer, favicon, and intro animation. Preserve its aspect ratio and transparent/background treatment.

---

Built for **Manamalar Mind Wellness Center**, Villupuram, Tamil Nadu.
