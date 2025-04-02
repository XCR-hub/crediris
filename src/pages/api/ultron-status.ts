// pages/api/ultron-status.ts
import type { NextApiRequest, NextApiResponse } from "next";

let counter = 0;

const logs = [
  "🧠 Initialisation du noyau Ultron...",
  "🚀 Récupération des dépendances...",
  "🔁 Synchronisation StackBlitz...",
  "📤 Push GitHub vers la branche main...",
  "🏗️ Build Vercel déclenché...",
  "✅ Déploiement terminé avec succès.",
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  counter = (counter + 1) % logs.length;
  const now = new Date().toISOString().split("T")[1].split(".")[0];
  res.status(200).json({
    logs: logs.slice(0, counter + 1).map((message, i) => ({
      timestamp: now,
      message,
    })),
  });
}

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: "OK ✅ Vercel connecté" });
}
