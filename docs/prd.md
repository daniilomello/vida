# Product Requirements Document (PRD): Personal Finance MVP

## 1. Overview & Objective
This document outlines the Minimum Viable Product (MVP) for a personal finance web application. The core objective is to create a frictionless, secure, and highly tailored Progressive Web App (PWA) to help the user track daily expenses, monitor recurring bills, and audit credit card usage. By acting as a "Leak Detector" and a "Peace of Mind Dashboard," the app will eliminate financial fog and provide clear visibility into spending habits.

## 2. Target Audience
**Primary User:** The Developer (Single-user focus for the MVP).
**User Profile:** Someone who wants to organize their financial life but struggles with the friction of complex budgeting apps. They have recurring bills split between cash and credit cards and need a clear, secure way to view this breakdown without linking bank accounts.

## 3. Problem Statement
* **The Financial Fog:** Difficulty tracking where money goes daily. High friction in logging expenses leads to abandoned tracking.
* **The Credit Card Confusion:** Losing track of how many recurring subscriptions and bills are charged to credit cards versus paid in cash.
* **Privacy Concerns:** Fear of sensitive financial data being exposed if someone else uses or glances at the user's phone.

## 4. Core Features & Functionality

### 4.1. Frictionless Expense Entry (The "Quick Add")
* **Description:** A highly optimized interface to log an expense in under 5 seconds.
* **Inputs Required:** * **Amount:** Numeric field.
    * **Category:** Dropdown/Radio buttons (e.g., Food, Transport, Utilities, Entertainment).
    * **Paid Via:** Dropdown/Radio buttons (e.g., Cash, Debit, or any credit card registered by the user — identified by a custom nickname such as "Nubank" or "Inter").
    * **Date:** Defaults to today, but adjustable.
* **Behavior:** On submit, clear the form and display a quick success toast.

### 4.2. Recurring Bills Tracker (The "Peace of Mind Dashboard")
* **Description:** A checklist-style view for fixed monthly obligations.
* **Functionality:**
    * Add a recurring bill (Name, Amount, Due Date, Paid Via).
    * Display a list of "Upcoming Bills" for the current month.
    * Checkbox to mark a bill as "Paid" for the current cycle.
    * Automatically reset/regenerate the checklist at the start of a new month.
    * Pause (soft-delete) a bill to temporarily exclude it from generation, and reactivate it later without losing its configuration.

### 4.3. The Credit Card Audit
* **Description:** A specialized view dedicated to uncovering hidden credit card charges.
* **Functionality:**
    * Select a specific registered credit card to filter all monthly transactions and bills charged to it.
    * Display the total running balance for the selected card for the month to prevent end-of-month surprises.
    * Users can switch between cards to audit each one independently.

### 4.4. Monthly Snapshot (The "Leak Detector")
* **Description:** A simple analytics dashboard summarizing the month's activity.
* **Functionality:**
    * Total spent this month.
    * Breakdown of spending by Category (sorted list from highest to lowest, or a simple chart).
    * Breakdown by payment method: total per cash, debit, and each registered credit card individually.

### 4.5. PWA & Offline Capabilities
* **Description:** The app must look and feel like a native mobile app.
* **Functionality:** * Installable to iOS/Android home screen.
    * Service worker caching to allow the app to load without an internet connection.
    * *Future Enhancement:* Offline transaction queueing (save locally, sync to cloud when online).

## 5. Security & Privacy Requirements
* **Authentication:** Secured via Amazon Cognito with two login options on the same screen:
    * **Email + Password** — standard login for daily use.
    * **Email OTP** — passwordless login; Cognito sends a 6-digit code to the user's email, no password required.
* **Password Reset:** Native Cognito flow — user requests a reset code via email and sets a new password directly in the app. No external tooling required.
* **Token Storage:** JWT tokens must be stored exclusively in `httpOnly; Secure; SameSite=Strict` cookies — never in `localStorage` or JS-accessible memory — to prevent XSS exposure.
* **Session Management:** Implement long-lived sessions via automatic RefreshToken rotation, so the user doesn't have to re-authenticate frequently. The device's native lock screen (PIN/Biometrics) protects access to the browser/PWA.
* **Data Isolation:** Data must be strictly tied to the authenticated user's ID.

## 6. Out of Scope for MVP (V2 Features)
* Bank API integrations (Plaid/Teller).
* Complex multi-user households.
* Investment and stock portfolio tracking.
* User-managed categories (categories are a fixed enum in MVP).
