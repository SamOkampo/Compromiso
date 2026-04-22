import { Resend } from "resend";

const tasks = [
  "Terminar un informe pendiente",
  "Llegar 5 minutos antes a tu próxima cita",
  "Aportar una idea extra en tu grupo de estudio",
  "Confirmar por escrito un acuerdo importante",
  "Ayudar a un compañero a desbloquear una tarea",
];

function pickTask() {
  return tasks[Math.floor(Math.random() * tasks.length)];
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanText(value, maxLength = 220) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(101, Math.round(score)));
}

function normalizeDiagnostic(diagnostic) {
  if (!diagnostic || typeof diagnostic !== "object") return null;

  const dimensions = diagnostic.dimensions || {};
  return {
    score: cleanScore(diagnostic.score),
    label: cleanText(diagnostic.label, 80),
    insight: cleanText(diagnostic.insight, 260),
    dimensions: {
      cumplimiento: cleanScore(dimensions.cumplimiento),
      comunicacion: cleanScore(dimensions.comunicacion),
      valorAgregado: cleanScore(dimensions.valorAgregado),
    },
    habits: Array.isArray(diagnostic.habits)
      ? diagnostic.habits.map((habit) => cleanText(habit, 100)).filter(Boolean).slice(0, 3)
      : [],
  };
}

function buildDiagnosticHtml(diagnostic) {
  if (!diagnostic) return "";

  const habits = diagnostic.habits.length
    ? diagnostic.habits.map((habit) => `<li style="margin:0 0 8px 0;">${escapeHtml(habit)}</li>`).join("")
    : '<li style="margin:0 0 8px 0;">Sin hábitos adicionales marcados en el diagnóstico.</li>';

  return `
    <div style="margin-top:24px;padding:18px;border-radius:8px;background:#f8fafc;border:1px solid #dbe3ea;">
      <p style="margin:0 0 8px 0;color:#17202a;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:0;">Resultado del diagnóstico</p>
      <p style="margin:0 0 12px 0;color:#17202a;font-size:22px;line-height:1.3;font-weight:900;">
        ${diagnostic.score}% · ${escapeHtml(diagnostic.label)}
      </p>
      <p style="margin:0 0 14px 0;color:#4f6275;font-size:14px;line-height:1.7;">${escapeHtml(diagnostic.insight)}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 14px 0;">
        <tr>
          <td style="padding:10px;border:1px solid #dbe3ea;color:#17202a;font-size:13px;font-weight:800;">Cumplimiento<br><span style="font-size:18px;">${diagnostic.dimensions.cumplimiento}%</span></td>
          <td style="padding:10px;border:1px solid #dbe3ea;color:#17202a;font-size:13px;font-weight:800;">Comunicación<br><span style="font-size:18px;">${diagnostic.dimensions.comunicacion}%</span></td>
          <td style="padding:10px;border:1px solid #dbe3ea;color:#17202a;font-size:13px;font-weight:800;">Valor agregado<br><span style="font-size:18px;">${diagnostic.dimensions.valorAgregado}%</span></td>
        </tr>
      </table>
      <p style="margin:0 0 8px 0;color:#17202a;font-size:14px;font-weight:900;">Hábitos marcados</p>
      <ul style="margin:0;padding-left:18px;color:#4f6275;font-size:14px;line-height:1.6;">${habits}</ul>
    </div>
  `;
}

function buildDiagnosticText(diagnostic) {
  if (!diagnostic) return "";

  const habits = diagnostic.habits.length
    ? diagnostic.habits.map((habit) => `- ${habit}`).join("\n")
    : "- Sin hábitos adicionales marcados en el diagnóstico.";

  return `

Resultado del diagnóstico:
${diagnostic.score}% - ${diagnostic.label}
${diagnostic.insight}
Cumplimiento: ${diagnostic.dimensions.cumplimiento}%
Comunicación: ${diagnostic.dimensions.comunicacion}%
Valor agregado: ${diagnostic.dimensions.valorAgregado}%
Hábitos marcados:
${habits}`;
}

function buildEmailHtml(task, diagnostic) {
  return `
    <div style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,Helvetica,sans-serif;color:#17202a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fa;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dbe3ea;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#17202a;padding:28px 28px 22px 28px;">
                  <p style="margin:0 0 10px 0;color:#f2b84b;font-size:12px;font-weight:800;letter-spacing:0;text-transform:uppercase;">Feria de las Habilidades</p>
                  <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.2;font-weight:900;">Compromiso del Día</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px 28px;">
                  <p style="margin:0 0 18px 0;color:#17202a;font-size:17px;line-height:1.7;">
                    Este es tu recordatorio de compromiso: <strong>${escapeHtml(task)}</strong>.
                    Recuerda que en administración, tu capacidad de cumplir determina tu éxito y el de tu equipo.
                    <strong>¡Haz que pase!</strong>
                  </p>
                  <div style="margin-top:24px;padding:18px;border-radius:8px;background:#eef5f3;border:1px solid #cfe6dc;">
                    <p style="margin:0;color:#1f9d78;font-size:14px;line-height:1.6;font-weight:800;">
                      El 100% cumple la tarea. El 101% agrega valor, anticipa riesgos y fortalece la confianza.
                    </p>
                  </div>
                  ${buildDiagnosticHtml(diagnostic)}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px;background:#f4f7fa;color:#4f6275;font-size:12px;line-height:1.6;">
                  Facultad de Ciencias Económicas · Proyecto universitario sobre el valor del compromiso.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Método no permitido." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Feria de las Habilidades <onboarding@resend.dev>";

  if (!apiKey) {
    return res.status(500).json({ message: "Falta configurar RESEND_API_KEY en el servidor." });
  }

  let body;

  try {
    body = getRequestBody(req);
  } catch {
    return res.status(400).json({ message: "El cuerpo de la solicitud no es JSON válido." });
  }

  const { email } = body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Ingrese un correo electrónico válido." });
  }

  const task = tasks.includes(body.task) ? body.task : pickTask();
  const diagnostic = normalizeDiagnostic(body.diagnostic);
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject: "Tu Compromiso del Día",
    html: buildEmailHtml(task, diagnostic),
    text: `Este es tu recordatorio de compromiso: ${task}. Recuerda que en administración, tu capacidad de cumplir determina tu éxito y el de tu equipo. ¡Haz que pase!${buildDiagnosticText(diagnostic)}`,
  });

  if (error) {
    return res.status(400).json({
      message: "Resend no pudo enviar el correo.",
      details: error,
    });
  }

  return res.status(200).json({
    id: data?.id,
    task,
    message: "Correo enviado correctamente.",
  });
}
