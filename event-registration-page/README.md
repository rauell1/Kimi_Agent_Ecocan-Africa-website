Dyness & ROAM Solar Industry Roundtable - Event Portal & Registration System

This repository contains the frontend landing page, registration portal, and backend serverless logic for the Dyness & ROAM Solar Industry Breakfast, Roundtable & Partner Engagement event.

The system is designed to handle an invite-only event with strict capacity constraints, real-time UI updates, and automated HTML email dispatching.

🚀 Features

Premium UI/UX: Fully responsive, modern design with an integrated Light/Dark mode toggle.

Dynamic Capacity Tracking: The registration form displays a real-time progress bar tracking confirmed seats against the total capacity.

Strict Concurrency Control: The backend uses Google Apps Script LockService to prevent race conditions and overbooking when multiple users submit simultaneously.

Intelligent Status Assignment: * Users who select "Yes, I will attend" are marked as Confirmed (until the 110-seat limit is reached).

If the 110-seat limit is reached, overflow users are marked as Pending Confirmation (Waitlisted) up to a hard system limit of 300 total entries.

Users who select "Interested, need more info" are marked as Information Requested and do not consume a confirmed seat.

Automated Email Dispatch: Sends beautiful, branded HTML emails customized automatically based on the user's assigned status.

📂 Project Structure

index.html: The main event landing page featuring the agenda, value proposition, speaker highlights, and calls-to-action.

registration.html: The dynamic registration form. It fetches current capacity statistics on load (and every 15 seconds) and handles form submissions asynchronously via JavaScript fetch.

Code.gs: The Google Apps Script backend. It acts as a serverless API (handling GET and POST requests), writes data to a Google Sheet, calculates capacity limits, and sends automated emails.

🛠️ Setup & Deployment Guide

1. Backend Setup (Google Sheets & Apps Script)

Create the Database: Create a new Google Sheet. Name the active worksheet tab exactly Registrations.

Add Headers: In Row 1, add the following headers (order doesn't technically matter for the script, but keeps it organized):

Timestamp, Name, Email, Phone, Company, Job Title, Segment, Experience, Attendance Intent, Project Scale, Project Regions, Topics, Dyness Familiarity, Referral Source, Status.

Attach the Script: Go to Extensions > Apps Script.

Paste the Code: Clear any existing code and paste the contents of Code.gs.

Link the Sheet: Copy your Google Sheet ID from its URL (the long string between /d/ and /edit). Paste this ID into line 11 of Code.gs:

const SPREADSHEET_ID = "YOUR_SHEET_ID_HERE"; 


Deploy as Web App: * Click Deploy > New deployment.

Select type: Web App.

Execute as: Me.

Who has access: Anyone.

Click Deploy and authorize the permissions.

Copy the Web App URL: You will need this for the frontend.

2. Frontend Setup

Open registration.html in your code editor.

Locate the JavaScript section at the bottom of the file.

Find the WEB_APP_URL variable:

const WEB_APP_URL = "[https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec](https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec)";


Replace the placeholder URL with the Web App URL you copied from Google Apps Script.

Hosting: Deploy index.html, registration.html, and your assets/ folder to any static hosting provider (e.g., Vercel, Netlify, GitHub Pages, or AWS S3).

🧪 Testing the System

The backend includes a built-in simulation function to safely test capacity limits.

Open your Apps Script editor (Code.gs).

Select the simulate300Registrations function from the dropdown menu in the toolbar.

Click Run.

Check your Google Sheet—it will be populated with 300 test entries (110 Confirmed, 190 Pending Confirmation).

Note: Running this simulation will clear your existing sheet data.

⚙️ Modifying Capacity Limits

If you need to change the venue size or overall system limit, open Code.gs and modify these constants at the top of the file:

const MAX_CONFIRMED = 110; // The threshold where users are pushed to the waitlist
const MAX_TOTAL = 300;     // The hard limit where the form locks completely


(Remember: After making changes to Code.gs, you must go to Deploy > Manage Deployments > Edit > New Version > Deploy for the changes to take effect).

📧 Email Administration

All automated emails are sent from the Google Account that deployed the script. If a user replies to an automated email, their reply will be directed to the replyTo address configured in Code.gs (roy.otieno@roam-electric.com).
