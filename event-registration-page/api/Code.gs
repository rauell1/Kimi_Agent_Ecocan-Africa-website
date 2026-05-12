/**
 * PRODUCTION GOOGLE APPS SCRIPT - Dyness Roundtable Registration
 * * Instructions:
 * 1. Open Google Sheets, go to Extensions > Apps Script.
 * 2. Paste this code into Code.gs.
 * 3. UPDATE the SPREADSHEET_ID variable below with your actual Sheet ID.
 * 4. Ensure your active sheet is named "Registrations" and has headers in row 1.
 * 5. Deploy > Manage Deployments > New Version > Deploy.
 */

const SPREADSHEET_ID = "1ajzT2qo9BI6aSC4PkbVorZ9ef10seBv8BwLWGu4qX88"; 
const SHEET_NAME = "Registrations";
const MAX_CONFIRMED = 110;
const MAX_TOTAL = 300;

// --- API ENDPOINTS ---

function doGet(e) {
  const stats = getRegistrationStats();
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    confirmed_count: stats.confirmed,
    total_count: stats.total
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(10000); 
    
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return errorResponse("Invalid JSON payload.");
    }

    // --- Strict Validation for ALL Fields ---
    const name = data.name || data.fullName;
    if (!name) return errorResponse("Missing required field: name");
    
    const email = data.email;
    if (!email) return errorResponse("Missing required field: email");
    
    const phone = data.phone;
    if (!phone) return errorResponse("Missing required field: phone");
    
    const company = data.company;
    if (!company) return errorResponse("Missing required field: company");
    
    const jobTitle = data.job_title || data.jobTitle;
    if (!jobTitle) return errorResponse("Missing required field: job_title");
    
    const segment = data.segment;
    if (!segment) return errorResponse("Missing required field: segment");
    
    const experience = data.experience;
    if (!experience) return errorResponse("Missing required field: experience");
    
    const attendanceIntent = data.attendance_intent || data.attendanceIntent;
    if (!attendanceIntent) return errorResponse("Missing required field: attendance_intent");
    
    const projectScale = data.project_scale || data.projectScale;
    if (!projectScale) return errorResponse("Missing required field: project_scale");
    
    const projectRegions = data.project_regions || data.projectRegions;
    if (!projectRegions) return errorResponse("Missing required field: project_regions");
    
    const topics = data.topics;
    if (!topics) return errorResponse("Missing required field: topics");
    
    const dynessFamiliarity = data.dyness_familiarity || data.dynessFamiliarity;
    if (!dynessFamiliarity) return errorResponse("Missing required field: dyness_familiarity");
    
    const referralSource = data.referral_source || data.referralSource;
    if (!referralSource) return errorResponse("Missing required field: referral_source");
    // --- End Validation ---

    const sheet = getActiveSheetSafe();
    if (!sheet) return errorResponse(`Sheet named '${SHEET_NAME}' not found. Check your SPREADSHEET_ID and sheet name.`);

    const stats = getRegistrationStats();
    
    if (stats.total >= MAX_TOTAL) {
      return errorResponse("Registrations are completely closed.");
    }
    
    // --- IMPROVED STATUS ASSIGNMENT ---
    let assignedStatus;
    if (attendanceIntent === "Interested") {
      // If they just want info, do not consume a confirmed seat
      assignedStatus = "Information Requested";
    } else {
      // Otherwise, assign confirmed or waitlist based on capacity
      assignedStatus = stats.confirmed < MAX_CONFIRMED ? 'Confirmed' : 'Pending Confirmation';
    }
    
    const timestamp = new Date();
    const rowData = [
      timestamp,
      name,
      email,
      phone,
      company,
      jobTitle,
      segment,
      experience,
      attendanceIntent,
      projectScale,
      projectRegions,
      topics,
      dynessFamiliarity,
      referralSource,
      assignedStatus
    ];
    
    sheet.appendRow(rowData);
    SpreadsheetApp.flush();
    
    sendAutomatedEmail(email, name, assignedStatus);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      registration_status: assignedStatus,
      message: assignedStatus === 'Confirmed' ? 'Seat reserved' : (assignedStatus === 'Information Requested' ? 'Interest recorded' : 'Added to waitlist')
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return errorResponse(error.toString());
  } finally {
    lock.releaseLock();
  }
}

// --- HELPER FUNCTIONS ---

function getActiveSheetSafe() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    if (!SPREADSHEET_ID || SPREADSHEET_ID === "YOUR_SPREADSHEET_ID_HERE") {
      throw new Error("SPREADSHEET_ID is missing. Please paste your Google Sheet ID at the top of Code.gs.");
    }
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return ss.getSheetByName(SHEET_NAME);
}

function getRegistrationStats() {
  const sheet = getActiveSheetSafe();
  if (!sheet) return { total: 0, confirmed: 0 };
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { total: 0, confirmed: 0 }; 
  
  const statusColumnData = sheet.getRange(2, 15, lastRow - 1, 1).getValues();
  
  let confirmedCount = 0;
  for (let i = 0; i < statusColumnData.length; i++) {
    if (statusColumnData[i][0] === "Confirmed") {
      confirmedCount++;
    }
  }
  
  return {
    total: lastRow - 1,
    confirmed: confirmedCount
  };
}

/**
 * Dispatches a stylized HTML email based on the assigned status.
 */
function sendAutomatedEmail(email, fullName, status) {
  if (!email) return;
  
  const firstName = fullName ? fullName.split(' ')[0] : 'there';
  
  let subject, greeting, introText, buttonsHtml;
  
  if (status === 'Confirmed') {
    subject = "Your Seat is Confirmed – Dyness Roundtable";
    greeting = `You're confirmed, ${firstName}! 🎉`;
    introText = `Thank you for registering for the <strong>Dyness Solar Industry Roundtable & Partner Engagement</strong>. We look forward to seeing you at Roam Park.`;
    buttonsHtml = `
      <h3 style="font-family: Arial, sans-serif; color: #111827; margin-top: 35px; font-size: 16px;">Your next steps:</h3>
      <a href="https://calendar.app.google/hmh6zLMVPx7dRpZt5" style="display: block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 8px; font-family: Arial, sans-serif; font-weight: bold; text-align: center; margin-bottom: 12px; font-size: 15px;">
        📅 Add to Google Calendar
      </a>
      <a href="https://chat.whatsapp.com/KFHrwHcbDx58FFMCBga3tl" style="display: block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 8px; font-family: Arial, sans-serif; font-weight: bold; text-align: center; font-size: 15px;">
        💬 Join the WhatsApp Group for event updates
      </a>
    `;
  } else if (status === 'Pending Confirmation') {
    subject = "Registration Received – Pending Confirmation";
    greeting = `Registration received, ${firstName} 🕒`;
    introText = `Thank you for registering for the <strong>Dyness Solar Industry Roundtable & Partner Engagement</strong>. All confirmed seats are currently full, so we have added you to our pending confirmation waitlist. We will notify you immediately if a spot opens up.`;
    buttonsHtml = `
      <h3 style="font-family: Arial, sans-serif; color: #111827; margin-top: 35px; font-size: 16px;">Your next steps:</h3>
      <a href="https://chat.whatsapp.com/KFHrwHcbDx58FFMCBga3tl" style="display: block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 8px; font-family: Arial, sans-serif; font-weight: bold; text-align: center; font-size: 15px;">
        💬 Join the WhatsApp Group for event updates
      </a>
    `;
  } else {
    // Information Requested
    subject = "We've received your interest – Dyness Roundtable";
    greeting = `Hello ${firstName},`;
    introText = `Thank you for expressing interest in the <strong>Dyness Solar Industry Roundtable & Partner Engagement</strong>. We noted that you need a bit more information before making a final decision on attending. Our team will reach out to you shortly to provide additional details and answer any questions you may have.`;
    buttonsHtml = `
      <h3 style="font-family: Arial, sans-serif; color: #111827; margin-top: 35px; font-size: 16px;">Have specific questions now?</h3>
      <a href="https://chat.whatsapp.com/KFHrwHcbDx58FFMCBga3tl" style="display: block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px; border-radius: 8px; font-family: Arial, sans-serif; font-weight: bold; text-align: center; font-size: 15px;">
        💬 Reach out to us in the WhatsApp Group
      </a>
    `;
  }

  const htmlBody = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #374151; padding: 20px; line-height: 1.6;">
      
      <!-- Header -->
      <div style="background-color: #0f172a; border-radius: 12px; padding: 35px 20px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ffffff; margin: 0; font-family: Arial, sans-serif; font-size: 22px;">Dyness Solar Industry Roundtable</h1>
        <p style="color: #94a3b8; margin: 8px 0 0 0; font-family: Arial, sans-serif; font-size: 14px;">Celebrating Partnerships, Powering Growth</p>
      </div>

      <!-- Greeting & Intro -->
      <h2 style="color: #111827; font-size: 20px; margin-bottom: 15px;">${greeting}</h2>
      <p style="font-size: 15px; margin-bottom: 30px;">${introText}</p>

      <!-- Event Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="background-color: #f9fafb; padding: 16px; width: 90px; color: #6b7280; font-weight: bold; font-size: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">DATE</td>
          <td style="padding: 16px; color: #111827; font-weight: bold; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Thursday, May 21, 2026</td>
        </tr>
        <tr>
          <td style="background-color: #f9fafb; padding: 16px; color: #6b7280; font-weight: bold; font-size: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">TIME</td>
          <td style="padding: 16px; color: #111827; font-weight: bold; font-size: 14px; border-bottom: 1px solid #e5e7eb;">8:00 AM – 11:00 AM (EAT)</td>
        </tr>
        <tr>
          <td style="background-color: #f9fafb; padding: 16px; color: #6b7280; font-weight: bold; font-size: 12px; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">VENUE</td>
          <td style="padding: 16px; color: #111827; font-weight: bold; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Roam Park, Mombasa Road, Nairobi</td>
        </tr>
        <tr>
          <td style="background-color: #f9fafb; padding: 16px; color: #6b7280; font-weight: bold; font-size: 12px; letter-spacing: 0.5px;">CONTACT</td>
          <td style="padding: 16px; color: #111827; font-size: 14px;"><a href="mailto:roy.otieno@roam-electric.com" style="color: #3b82f6; text-decoration: none;">roy.otieno@roam-electric.com</a> &nbsp;|&nbsp; +254704612435</td>
        </tr>
      </table>

      <!-- Dynamic Buttons -->
      ${buttonsHtml}

      <!-- Footer -->
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px 0;" />
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
        This communication was sent to <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a> because you submitted a form for the Dyness Roundtable. For questions contact <a href="mailto:roy.otieno@roam-electric.com" style="color: #3b82f6; text-decoration: none;">roy.otieno@roam-electric.com</a>.
      </p>

    </div>
  `;
  
  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      name: "Dyness Events",
      replyTo: "roy.otieno@roam-electric.com"
    });
  } catch (e) {
    console.error("Failed to send email to: " + email, e);
  }
}

function errorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}