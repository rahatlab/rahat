require("dotenv").config({ path: ".env.local" });
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
  console.log("FROM:", process.env.EMAIL_FROM);
  console.log("TO:", process.env.ADMIN_EMAIL || "contract.rahat@gmail.com");
  console.log("KEY prefix:", (process.env.RESEND_API_KEY || "").slice(0, 6));

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Portfolio <onboarding@resend.dev>",
    to: process.env.ADMIN_EMAIL || "contract.rahat@gmail.com",
    subject: "Reset your portfolio admin password (direct test)",
    html: "<p>Direct Resend connectivity test from the portfolio project.</p>",
  });

  if (error) {
    console.log("RESEND ERROR:", JSON.stringify(error, null, 2));
    process.exit(1);
  }
  console.log("RESEND ACCEPTED, id =", data?.id);
})();
