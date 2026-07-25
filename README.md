# NexOrbit (LeadDesk) ✨
*Built for Digital Heroes Training Task*

Hey there! Welcome to my submission for the Digital Heroes training task. I built **NexOrbit** — a modern, fully-functional agency landing page that doesn't just look pretty, but actually captures client leads and lets an admin manage them all in one place.

Here's everything you need to know about how I built it and how it works!

---

## 🔗 Live Links & Walkthrough

- **Live Public Site:** https://nex-orbit-agency.vercel.app
- **Admin Dashboard:** https://nex-orbit-agency.vercel.app/admin
- **Backend API:** https://nexorbit-agency.onrender.com
- **GitHub Repository:** https://github.com/Multi-meta/NexOrbit-Agency

*(Note: Admin test credentials have been excluded from this public repository for security purposes. They will be provided privately for evaluation.)*

---

## 🏄‍♂️ How the Flow Works (The User Journey)

I wanted to make the experience as seamless as possible for both the client and the agency owner. Here's what happens:

1. **A visitor lands on the site:** They see the NexOrbit public landing page, which features smooth micro-animations, a clean layout, and a prominent lead capture form.
2. **They submit a project inquiry:** They fill out their name, email, budget, and project details. 
3. **The Admin logs in:** The agency owner logs into the `/admin` dashboard securely.
4. **Managing the Pipeline:** The admin sees the new lead pop up on their dashboard with a "New" status. They get a birds-eye view of all leads with charts breaking down budgets and lead statuses.
5. **Reaching out:** The admin clicks "Contact" on the lead. A beautiful modal pops up where they can instantly type out an email or open WhatsApp to message the client directly.
6. **Automatic tracking:** The moment the admin sends that email, the system automatically logs the conversation in the dashboard and smartly updates the lead's status from "New" to "Contacted". Once the deal is secured, the admin can manually mark it as "Closed".

---

## 🗄️ How Data is Stored (The Data Model)

Under the hood, the backend is powered by Node.js, Express, and a **MongoDB** database. I kept the data model clean and focused on two main collections:

- **Leads:** This is where the magic happens. Every time someone submits the contact form, a new document is created here. It stores their personal info (`name`, `email`, `phone`), their `message` and `budgetRange`, and their current pipeline `status` (New, Contacted, or Closed). It also has a `messages` array where it saves a historical log of every email or WhatsApp message the admin sends them!
- **Admins:** A simple, secure collection just for the agency owners. It stores the admin's `email` and a securely hashed `passwordHash` (using bcrypt) so that passwords are never stored in plain text.

*(Note: The charts on the admin dashboard don't need their own database collection. Instead, the backend dynamically calculates those stats on the fly by grouping the Leads data together!)*

---

## 🔐 How Login Works (Authentication)

For the admin dashboard, I implemented a very secure **Stateless JWT (JSON Web Token)** approach combined with **HTTP-Only Cookies**. 

Here is why I chose this method and how it works in plain English:
When the admin types in their email and password, the server verifies it and creates a special, temporary "VIP pass" (the JWT). Instead of giving this pass to the browser where hackers might try to steal it using malicious JavaScript (XSS attacks), the server hides the pass inside a secure, "HTTP-Only" cookie. 

Every time the admin tries to view their leads, the browser automatically shows this hidden VIP pass to the server. The server checks the pass, realizes it's valid, and hands over the data. The admin stays logged in seamlessly without us having to store active sessions in the database, making the app much faster and incredibly secure!

---

## 🛠️ Tech Stack Used
- **Frontend:** React, Vite, Recharts (for the dashboard charts), Vanilla CSS.
- **Backend:** Node.js, Express, Nodemailer (for sending real emails via Gmail).
- **Database:** MongoDB Atlas, Mongoose.
- **Deployment:** Vercel (Frontend) & Render (Backend).

<br>
*Thank you for reviewing my project!*
