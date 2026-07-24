import nodemailer from "nodemailer";

/**
 * Sends the post-payment confirmation email through the Titan mailbox
 * (info@horizontvisual.com) over SMTP. All settings come from env so no
 * credentials live in the code:
 *   SMTP_HOST      (default smtp.titan.email)
 *   SMTP_PORT      (default 465, SSL)
 *   SMTP_USER      the full mailbox address, also the From/Reply-To
 *   SMTP_PASSWORD  the mailbox password
 */

const FROM_NAME = "Horizont Visuals";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.titan.email";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) {
    throw new Error("SMTP_USER / SMTP_PASSWORD are not set.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user, pass },
  });
  return transporter;
}

/** First name only, for a warmer greeting; falls back to a neutral opener. */
function firstName(full: string | null | undefined): string {
  const name = (full || "").trim();
  return name ? name.split(/\s+/)[0] : "";
}

function buildEmail(name: string) {
  const hi = name ? `Bună, ${name},` : "Bună,";

  const text = `${hi}

Îți mulțumesc pentru comandă — plata a fost confirmată.

Îți pregătesc cele patru camere transformate în stil clasic-contemporan. Te voi contacta cât mai curând posibil, în timpul zilelor lucrătoare (luni–vineri), la numărul de telefon lăsat, ca să stabilim împreună ziua și ora discuției live de 20 de minute. Acolo îți prezint designul și îți răspund la orice întrebare.

Nu trebuie să faci nimic acum — doar ține telefonul aproape.

Îți mulțumesc încă o dată,
Ruben Fogaras · Horizont Visuals
info@horizontvisual.com`;

  const html = `<!doctype html>
<html lang="ro">
<body style="margin:0;padding:0;background:#f6f1e8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e8;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e4dcc9;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#1b2236;padding:22px 32px;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#f6f1e8;">Horizont <em style="color:#d8be8e;">Visuals</em></span>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 8px;">
              <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#b08a4a;font-weight:bold;">Plată confirmată</p>
              <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;line-height:1.25;color:#1a1d2c;">${hi}</h1>
              <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3d4255;">
                Îți mulțumesc pentru comandă — plata a fost confirmată.
              </p>
              <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3d4255;">
                Îți pregătesc cele patru camere transformate în stil clasic-contemporan. Te voi contacta <strong style="color:#1a1d2c;">cât mai curând posibil, în timpul zilelor lucrătoare (luni–vineri)</strong>, la numărul de telefon lăsat, ca să stabilim împreună ziua și ora discuției <em style="color:#b08a4a;">live</em> de 20 de minute. Acolo îți prezint designul și îți răspund la orice întrebare.
              </p>
              <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3d4255;">
                Nu trebuie să faci nimic acum — doar ține telefonul aproape.
              </p>
              <div style="height:1px;background:#e4dcc9;margin:0 0 20px;"></div>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1a1d2c;">
                Îți mulțumesc încă o dată,<br>
                <span style="color:#b08a4a;">Ruben Fogaras</span> · Horizont Visuals
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8d91a0;">
                <a href="mailto:info@horizontvisual.com" style="color:#8d91a0;">info@horizontvisual.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: "Plata confirmată — urmează discuția ta live", text, html };
}

/** Sends the confirmation email; returns nothing, throws on hard failure. */
export async function sendConfirmationEmail(opts: {
  to: string;
  name?: string | null;
}): Promise<void> {
  const from = process.env.SMTP_USER!;
  const { subject, text, html } = buildEmail(firstName(opts.name));
  await getTransporter().sendMail({
    from: `"${FROM_NAME}" <${from}>`,
    to: opts.to,
    replyTo: from,
    subject,
    text,
    html,
  });
}
